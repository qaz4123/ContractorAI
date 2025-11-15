import { Dossier, LeadScore } from '../types';

const parseRange = (rangeStr: string): { min: number; max: number } => {
    if (!rangeStr) return { min: 0, max: 0 };
    const cleaned = rangeStr.replace(/[^0-9.-]+/g, ' ').trim();
    const parts = cleaned.split(' ').map(p => parseFloat(p));

    if (rangeStr.includes('k')) {
        return {
            min: (parts[0] || 0) * 1000,
            max: (parts[1] || parts[0] || 0) * 1000,
        };
    }

    return {
        min: parts[0] || 0,
        max: parts[1] || parts[0] || 0,
    };
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);


export const calculateEquity = (dossier: Dossier): number => {
    // Use AI estimated balance if available, otherwise try to calculate it, finally fallback to simple subtraction
    if (dossier.mortgageDetails?.estimatedRemainingBalance) {
        return dossier.estimatedValue - dossier.mortgageDetails.estimatedRemainingBalance;
    }
    if (dossier.mortgageDetails && dossier.mortgageDetails.loanYear > 0 && dossier.mortgageDetails.estimatedRate > 0) {
         const principal = dossier.mortgageDetails.originalLoanAmount;
         const annualRate = dossier.mortgageDetails.estimatedRate / 100;
         const monthlyRate = annualRate / 12;
         const totalPayments = 30 * 12; // Assuming 30 year fixed
         const startYear = dossier.mortgageDetails.loanYear;
         const currentYear = new Date().getFullYear();
         const paymentsMade = (currentYear - startYear) * 12;

         if (paymentsMade <= 0) return dossier.estimatedValue - principal;
         if (paymentsMade >= totalPayments) return dossier.estimatedValue;

         // Standard amortization formula for remaining balance
         const remainingBalance = principal * (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
         
         return dossier.estimatedValue - Math.max(0, remainingBalance);
    }
    return dossier.estimatedValue - (dossier.mortgageDetails?.originalLoanAmount || 0);
};

// Centralized scoring logic with breakdown for consistency
export const calculateLeadScore = (dossier: Dossier, estimatedEquity: number): { score: LeadScore; value: number; breakdown: { label: string; value: string; points: number }[], uncertainty: number } => {
    let score = 0;
    let uncertainty = 0;
    const breakdown: { label: string; value: string; points: number }[] = [];
    const currentYear = new Date().getFullYear();

    const addBreakdown = (label: string, valueDisplay: string, points: number, isMissing: boolean = false, potentialPoints: number = 0) => {
        if (isMissing || valueDisplay === 'N/A' || valueDisplay === '$0') {
            uncertainty += potentialPoints;
        } else {
            score += points;
            breakdown.push({ label, value: valueDisplay, points });
        }
    };

    // 1. Financial Health (Max ~45 pts)
    let equityPoints = 0;
    if (estimatedEquity > 200000) equityPoints = 25;
    else if (estimatedEquity > 100000) equityPoints = 15;
    else if (estimatedEquity > 50000) equityPoints = 5;
    else if (estimatedEquity < 20000) equityPoints = -5;
    addBreakdown('Financial: Home Equity', formatCurrency(estimatedEquity), equityPoints, false, 20); // Equity is fundamental, never "missing"

    const income = parseRange(dossier.demographics.estHouseholdIncome);
    let incomePoints = 0;
    if (income.min >= 150000) incomePoints = 15;
    else if (income.min >= 100000) incomePoints = 10;
    else if (income.min >= 75000) incomePoints = 5;
    addBreakdown('Financial: Est. Income', dossier.demographics.estHouseholdIncome || 'N/A', incomePoints, !income.min, 10);

    const ltv = dossier.mortgageDetails?.estimatedRemainingBalance && dossier.estimatedValue > 0
        ? dossier.mortgageDetails.estimatedRemainingBalance / dossier.estimatedValue
        : null;
    let ltvPoints = 0;
    if (ltv !== null) {
        if (ltv < 0.5) ltvPoints = 10;
        else if (ltv < 0.75) ltvPoints = 5;
        else if (ltv > 0.9) ltvPoints = -10;
        addBreakdown('Financial: Loan-to-Value (LTV)', `${(ltv * 100).toFixed(0)}%`, ltvPoints);
    } else {
        addBreakdown('Financial: Loan-to-Value (LTV)', 'N/A', 0, true, 5);
    }
    
    // 2. Renovation Potential (Max ~40 pts)
    const { yearBuilt, yearRenovated, lastSalePrice, sqFootage } = dossier.propertyDetails;
    let agePoints = 0;
    let ageDisplay = 'N/A';
    if (yearBuilt > 0) {
        const age = currentYear - yearBuilt;
        if (age > 40) agePoints = 20;
        else if (age > 20) agePoints = 15;
        else if (age > 10) agePoints = 5;
        
        ageDisplay = `${age} years old`;

        if (yearRenovated && (currentYear - yearRenovated <= 7)) {
            agePoints = Math.max(0, agePoints - 15); // Heavily discount if recently renovated
            ageDisplay += `, renovated ${yearRenovated}`;
        }
    }
    addBreakdown('Potential: Property Age', ageDisplay, agePoints, !yearBuilt, 15);
    
    let appreciationPoints = 0;
    let appreciationDisplay = 'N/A';
    if (lastSalePrice > 0 && dossier.estimatedValue > lastSalePrice) {
        const appreciation = (dossier.estimatedValue - lastSalePrice) / lastSalePrice;
        if (appreciation > 0.75) appreciationPoints = 10;
        else if (appreciation > 0.30) appreciationPoints = 5;
        appreciationDisplay = `+${(appreciation * 100).toFixed(0)}% since last sale`;
    }
    addBreakdown('Potential: Home Appreciation', appreciationDisplay, appreciationPoints, !lastSalePrice, 5);

    let sizePoints = 0;
    if (sqFootage > 3000) sizePoints = 5;
    else if (sqFootage > 2000) sizePoints = 3;
    addBreakdown('Potential: Property Size', sqFootage ? `${sqFootage} sqft` : 'N/A', sizePoints, !sqFootage, 3);
    
    let projectSuggestionPoints = 0;
    if (dossier.projectSuggestions && dossier.projectSuggestions.length > 0) {
        const highValueCount = dossier.projectSuggestions.filter(s => s.estimatedCost > 30000 || s.estimatedROI > 80).length;
        projectSuggestionPoints = Math.min(10, highValueCount * 5);
    }
    addBreakdown('Potential: AI Project Ideas', `${dossier.projectSuggestions?.length || 0} suggestions`, projectSuggestionPoints, false, 5);

    // 3. Owner Profile (Max 10 pts)
    const ownerAge = parseRange(dossier.demographics.estOwnerAgeRange);
    let ownerAgePoints = 0;
    if (ownerAge.min >= 40 && ownerAge.max <= 65) ownerAgePoints = 10; // Prime spending years
    else if (ownerAge.min >= 30 && ownerAge.max < 70) ownerAgePoints = 5;
    addBreakdown('Profile: Owner Age', dossier.demographics.estOwnerAgeRange || 'N/A', ownerAgePoints, !ownerAge.min, 5);

    // 4. Risk Factors
    if (dossier.taxLiens) {
        addBreakdown('Risk: Tax Liens', 'Active lien found', -50);
    }
    
    // Final score normalization
    const scoreValue = Math.max(0, Math.min(100, Math.round(score)));

    let leadScore: LeadScore;
    if (scoreValue >= 75) leadScore = LeadScore.A;
    else if (scoreValue >= 45) leadScore = LeadScore.B;
    else leadScore = LeadScore.C;

    return { score: leadScore, value: scoreValue, breakdown, uncertainty };
};

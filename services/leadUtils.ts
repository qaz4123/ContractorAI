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
    let scoreValue = 0;
    let uncertainty = 0;
    const currentYear = new Date().getFullYear();
    const breakdown: { label: string; value: string; points: number }[] = [];

    const addScore = (points: number, label: string, value: string, potentialPointsIfMissing = 0) => {
        if (value === 'N/A' || !value || value === '$0' || (typeof value === 'number' && value === 0)) {
            uncertainty += potentialPointsIfMissing;
        } else {
            scoreValue += points;
            breakdown.push({ label, value, points });
        }
    };

    // Section 1: Financial Health
    let equityPoints = 0;
    if (estimatedEquity > 200000) equityPoints = 25;
    else if (estimatedEquity > 100000) equityPoints = 15;
    else if (estimatedEquity > 50000) equityPoints = 5;
    addScore(equityPoints, 'Estimated Equity', new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(estimatedEquity), 15);

    const income = parseRange(dossier.demographics.estHouseholdIncome);
    let incomePoints = 0;
    if (income.min >= 150000) incomePoints = 15;
    else if (income.min >= 100000) incomePoints = 10;
    else if (income.min >= 75000) incomePoints = 5;
    addScore(incomePoints, 'Est. Household Income', dossier.demographics.estHouseholdIncome, 10);
    
    // Section 2: Project Potential
    const { yearBuilt, yearRenovated, propertyType } = dossier.propertyDetails;
    let propertyAgePoints = 0;
    if (yearBuilt > 0) {
        const propertyAge = currentYear - yearBuilt;
        if (propertyAge > 40) propertyAgePoints = 15;
        else if (propertyAge > 20) propertyAgePoints = 10;
        else if (propertyAge > 10) propertyAgePoints = 5;

        if (yearRenovated && currentYear - yearRenovated <= 5) {
            propertyAgePoints = Math.max(0, propertyAgePoints - 15);
        }
        addScore(propertyAgePoints, 'Property Age & Condition', `${currentYear - yearBuilt} years old` + (yearRenovated ? `, renovated in ${yearRenovated}` : ''));
    } else {
        uncertainty += 10;
    }
    
    let projectPotentialPoints = 0;
    if (dossier.projectSuggestions && dossier.projectSuggestions.length > 0) {
        dossier.projectSuggestions.forEach(suggestion => {
            const name = suggestion.name.toLowerCase();
            if (name.includes('kitchen') || name.includes('addition') || name.includes('master bath') || name.includes('roof')) projectPotentialPoints += 5;
            if (suggestion.estimatedCost > 40000) projectPotentialPoints += 5;
            if (suggestion.estimatedROI > 80) projectPotentialPoints += 3;
        });
        projectPotentialPoints = Math.min(20, projectPotentialPoints); // Cap at 20
    }
    addScore(projectPotentialPoints, 'AI Project Suggestions', `${dossier.projectSuggestions?.length || 0} suggestions`, 5);

    let propertyTypePoints = 0;
    if (propertyType?.toLowerCase() === 'single-family') propertyTypePoints = 5;
    else if (propertyType?.toLowerCase() === 'townhouse') propertyTypePoints = 2;
    addScore(propertyTypePoints, 'Property Type', propertyType || 'N/A', 2);

    let neighborhoodPoints = 0;
    const neighborhoodVibe = dossier.neighborhoodInfo?.vibe?.toLowerCase();
    if (neighborhoodVibe && (neighborhoodVibe.includes('affluent') || neighborhoodVibe.includes('up-and-coming'))) {
        neighborhoodPoints = 5;
    }
    addScore(neighborhoodPoints, 'Neighborhood Vibe', dossier.neighborhoodInfo?.vibe || 'N/A', 5);

    // Section 3: Owner Profile & Risk Factors
    const age = parseRange(dossier.demographics.estOwnerAgeRange);
    let ownerAgePoints = 0;
    if (age.min >= 40 && age.max <= 65) ownerAgePoints = 10;
    else if (age.min >= 30 && age.max < 40) ownerAgePoints = 5;
    addScore(ownerAgePoints, 'Owner Age Range', dossier.demographics.estOwnerAgeRange, 5);
    
    let lienPoints = 0;
    if (dossier.taxLiens) {
      lienPoints = -50;
      addScore(lienPoints, 'Tax Liens', 'Active Liens Found');
    } else {
      addScore(0, 'Tax Liens', 'No Liens Found');
    }
    
    // Final score normalization
    scoreValue = Math.max(0, Math.min(100, scoreValue));

    let leadScore: LeadScore;
    if (scoreValue >= 80) leadScore = LeadScore.A;
    else if (scoreValue >= 50) leadScore = LeadScore.B;
    else leadScore = LeadScore.C;

    return { score: leadScore, value: Math.round(scoreValue), breakdown, uncertainty };
};

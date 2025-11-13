import { User, Lead, AggregatedStats, MarketTrend } from '../types';

const USERS_STORAGE_KEY = 'projectprospect_users';

const getAllPlatformLeads = (): Lead[] => {
    try {
        const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (!savedUsers) return [];
        const users: User[] = JSON.parse(savedUsers);
        // FIX: The `leads` property on User is optional. Provide an empty array as a fallback.
        return users.flatMap(user => user.leads || []);
    } catch (error) {
        console.error("Failed to fetch platform leads for analytics", error);
        return [];
    }
};

export const getAggregatedStats = (): AggregatedStats => {
    const leads = getAllPlatformLeads();
    const totalPropertiesAnalyzed = leads.length;

    if (totalPropertiesAnalyzed === 0) {
        return {
            avgPropertyValue: 0,
            avgEquity: 0,
            mostCommonProjects: [],
            totalPropertiesAnalyzed: 0
        };
    }

    const totalValue = leads.reduce((sum, lead) => sum + lead.dossier.estimatedValue, 0);
    const totalEquity = leads.reduce((sum, lead) => sum + lead.estimatedEquity, 0);

    const projectCounts: { [key: string]: { count: number; totalCost: number } } = {};
    leads.forEach(lead => {
        lead.dossier.projectSuggestions?.forEach(project => {
            if (!projectCounts[project.name]) {
                projectCounts[project.name] = { count: 0, totalCost: 0 };
            }
            projectCounts[project.name].count++;
            projectCounts[project.name].totalCost += project.estimatedCost;
        });
    });

    const mostCommonProjects = Object.entries(projectCounts)
        .map(([name, data]) => ({
            name,
            count: data.count,
            avgCost: data.totalCost / data.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5

    return {
        avgPropertyValue: Math.round(totalValue / totalPropertiesAnalyzed),
        avgEquity: Math.round(totalEquity / totalPropertiesAnalyzed),
        mostCommonProjects,
        totalPropertiesAnalyzed
    };
};

export const getMarketTrendsForLead = (lead: Lead): MarketTrend[] => {
    const stats = getAggregatedStats();
    if (stats.totalPropertiesAnalyzed < 5) return []; // Not enough data for meaningful trends

    const trends: MarketTrend[] = [];

    // Property Value Trend
    trends.push({
        category: 'Property Value',
        averageValue: stats.avgPropertyValue,
        trendDirection: lead.dossier.estimatedValue > stats.avgPropertyValue ? 'up' : 'down',
        dataPoints: stats.totalPropertiesAnalyzed
    });

    // Equity Trend
    trends.push({
        category: 'Home Equity',
        averageValue: stats.avgEquity,
        trendDirection: lead.estimatedEquity > stats.avgEquity ? 'up' : 'down',
        dataPoints: stats.totalPropertiesAnalyzed
    });

    return trends;
};
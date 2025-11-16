import React from 'react';
import { Quote } from '../types';

interface QuoteSummaryProps {
    quote: Quote;
    formatCurrency: (value: number) => string;
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({ quote, formatCurrency }) => {
    return (
        <div className="mt-2 border-t border-slate-200 pt-4">
            {quote.contractorName && (
                <div className="mb-3 pb-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Prepared by</p>
                    <p className="font-semibold text-slate-700">{quote.contractorName}</p>
                </div>
            )}
            <div className="space-y-2">
                {quote.lineItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-slate-700 hover:bg-slate-50 p-1 rounded">
                        <span className="flex-1 truncate pr-4">{item.description} ({item.quantity}x)</span>
                        <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                ))}
            </div>

            {(quote.materialCost || quote.laborCost || quote.expectedProfit) && (
                 <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1 text-sm">
                    {(quote.materialCost ?? 0) > 0 && (
                        <div className="flex justify-between text-slate-600">
                            <span>Material Cost</span>
                            <span>{formatCurrency(quote.materialCost!)}</span>
                        </div>
                    )}
                    {(quote.laborCost ?? 0) > 0 && (
                        <div className="flex justify-between text-slate-600">
                            <span>Labor Cost</span>
                            <span>{formatCurrency(quote.laborCost!)}</span>
                        </div>
                    )}
                    {quote.expectedProfit !== undefined && (
                        <div className="flex justify-between font-medium text-green-700 pt-1 mt-1 border-t border-slate-100">
                            <span>Expected Profit</span>
                            <span>{formatCurrency(quote.expectedProfit)}</span>
                        </div>
                    )}
                </div>
            )}
            
            <div className="flex justify-between text-lg font-bold text-slate-800 mt-2 pt-2 border-t-2 border-slate-200">
                <span>Total</span>
                <span>{formatCurrency(quote.total)}</span>
            </div>

            {quote.notes && (
                <div className="mt-4 text-xs text-slate-600 border-t pt-2">
                    <p className="font-semibold">Notes:</p>
                    <p className="whitespace-pre-wrap">{quote.notes}</p>
                </div>
            )}
        </div>
    );
};

export default QuoteSummary;
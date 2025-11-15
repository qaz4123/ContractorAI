


import { GoogleGenAI, Type, GroundingChunk, Content } from "@google/genai";
import { Dossier, QuoteLineItem, ProjectSuggestion, ChangeOrder } from "../types";
// FIX: Corrected typo in uuid import alias from uuidvv4 to uuidv4 to resolve reference error.
import { v4 as uuidv4 } from 'uuid';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const dossierSchema = {
  type: Type.OBJECT,
  properties: {
    ownerName: { type: Type.STRING, description: "Full name(s) of the property owner(s). e.g., 'John & Jane Doe'" },
    estimatedValue: { type: Type.NUMBER, description: "The current estimated market value of the property in USD." },
    taxLiens: { type: Type.BOOLEAN, description: "Whether there are active tax liens on the property. true or false." },
    mortgageDetails: {
      type: Type.OBJECT,
      properties: {
        originalLoanAmount: { type: Type.NUMBER, description: "The original principal amount of the mortgage loan in USD." },
        loanYear: { type: Type.INTEGER, description: "The year the original mortgage loan was taken out." },
        lenderName: { type: Type.STRING, description: "The name of the mortgage lender, if available. e.g., 'Wells Fargo'" },
        estimatedRate: { type: Type.NUMBER, description: "The estimated annual interest rate for the mortgage. e.g., 3.75 for 3.75%" },
        estimatedMonthlyPayment: { type: Type.NUMBER, description: "The estimated monthly mortgage payment (principal and interest) in USD." },
        estimatedRemainingBalance: { type: Type.NUMBER, description: "The estimated remaining principal balance on the mortgage in USD." },
      },
      required: ["originalLoanAmount", "loanYear", "lenderName", "estimatedRate", "estimatedMonthlyPayment"]
    },
    propertyDetails: {
      type: Type.OBJECT,
      properties: {
        yearBuilt: { type: Type.INTEGER, description: "The year the property was built." },
        sqFootage: { type: Type.INTEGER, description: "The total square footage of the property." },
        bedrooms: { type: Type.NUMBER, description: "The number of bedrooms." },
        bathrooms: { type: Type.NUMBER, description: "The number of bathrooms (e.g., 2.5)." },
        lastSaleDate: { type: Type.STRING, description: "The date of the last sale in YYYY-MM-DD format." },
        lastSalePrice: { type: Type.NUMBER, description: "The price of the last sale in USD." },
        lotSize: { type: Type.STRING, description: "The size of the property lot, e.g., '0.25 acres' or '10,000 sqft'" },
        yearRenovated: { type: Type.INTEGER, description: "The year of the most recent significant renovation, if known." },
        hoaFees: { type: Type.NUMBER, description: "The monthly Homeowners Association (HOA) fees in USD, if applicable." },
        propertyType: { type: Type.STRING, description: "The type of property, e.g., 'Single-Family', 'Condo', 'Townhouse'." },
        roofingMaterial: { type: Type.STRING, description: "The primary material of the roof, e.g., 'Asphalt Shingle', 'Metal', 'Tile'." },
        exteriorFinish: { type: Type.STRING, description: "The primary material of the exterior walls, e.g., 'Vinyl Siding', 'Brick', 'Stucco'." },
        heatingSystem: { type: Type.STRING, description: "The type of heating system, e.g., 'Forced Air', 'Boiler', 'Heat Pump'." },
        coolingSystem: { type: Type.STRING, description: "The type of cooling system, e.g., 'Central AC', 'Window Units', 'None'." },
      },
       required: ["yearBuilt", "sqFootage", "bedrooms", "bathrooms", "lastSaleDate", "lastSalePrice"]
    },
    demographics: {
      type: Type.OBJECT,
      properties: {
        estHouseholdIncome: { type: Type.STRING, description: "An estimated range of the household income. e.g., '$150k - $175k'" },
        estOwnerAgeRange: { type: Type.STRING, description: "An estimated age range of the owner. e.g., '45-55'" },
        lifeStageProfile: { type: Type.STRING, description: "A brief marketing life stage profile. e.g., 'Family with Teens'" },
        maritalStatus: { type: Type.STRING, description: "The likely marital status of the homeowner(s). e.g., 'Married', 'Single'" },
      },
      required: ["estHouseholdIncome", "estOwnerAgeRange", "lifeStageProfile", "maritalStatus"]
    },
    neighborhoodInfo: {
        type: Type.OBJECT,
        properties: {
            walkScore: { type: Type.STRING, description: "Estimated walkability score or description." },
            crimeRate: { type: Type.STRING, description: "General description of crime rate in the area." },
            vibe: { type: Type.STRING, description: "Short description of the neighborhood 'vibe' (e.g., 'Quiet suburban', 'Bustling urban')." },
        }
    },
    schoolRatings: { type: Type.STRING, description: "Summary of local school district ratings." },
    recentPermits: { type: Type.STRING, description: "Summary of recent building permit activity in the area." },
    publicRecordLinks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of direct URLs to official public property records (GIS, Auditor, etc.)"
    },
    ownerProfile: {
        type: Type.OBJECT,
        properties: {
            professionalTitle: { type: Type.STRING, description: "Inferred professional title or job role of the homeowner." },
            company: { type: Type.STRING, description: "Company or organization associated with the homeowner." },
            linkedinSummary: { type: Type.STRING, description: "Brief summary of public professional profile (e.g., LinkedIn headline)." },
            publicNotes: { type: Type.STRING, description: "Other relevant public notes about community involvement or interests." },
            email: { type: Type.STRING, description: "A publicly listed, likely business-related email address for the owner. e.g., 'jane.doe@company.com'" },
            phone: { type: Type.STRING, description: "A publicly listed, likely business-related phone number for the owner. e.g., '(555) 123-4567'" }
        }
    }
  },
  required: ["ownerName", "estimatedValue", "taxLiens", "mortgageDetails", "propertyDetails", "demographics"]
};

const quoteLineItemsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: "A clear and concise description of the line item. e.g., 'Supply and install kitchen cabinets'" },
            quantity: { type: Type.NUMBER, description: "The quantity for the line item. e.g., 1 for a project, or a number for units like sq ft." },
            unitPrice: { type: Type.NUMBER, description: "The estimated price for one unit of this item in USD. e.g., 8000" },
        },
        required: ["description", "quantity", "unitPrice"]
    }
};

const changeOrderSchema = {
    type: Type.OBJECT,
    properties: {
        scopeOfWork: { type: Type.STRING, description: "A detailed, professionally worded scope of work based on the user's request." },
        lineItems: quoteLineItemsSchema
    },
    required: ["scopeOfWork", "lineItems"]
};


const projectSuggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The name of the suggested renovation project. e.g., 'Kitchen Remodel'" },
            reason: { type: Type.STRING, description: "A brief, compelling reason why this project is a good fit, based on the provided data. e.g., 'The house was built in 1995, so the kitchen is likely outdated. An update would significantly increase property value.'" },
            estimatedCost: { type: Type.NUMBER, description: "A rough estimate of the project cost in USD. e.g., 25000" },
            estimatedROI: { type: Type.NUMBER, description: "The estimated Return on Investment as a percentage. e.g., 75 for 75%" },
        },
        required: ["name", "reason", "estimatedCost", "estimatedROI"]
    }
};

const projectPhasesSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The name of the project phase. e.g., 'Permits and Planning'" },
            suggestedDurationDays: { type: Type.INTEGER, description: "A typical duration for this phase in days. e.g., 14" },
        },
        required: ["name", "suggestedDurationDays"]
    }
};

export const summarizeDossierForContractor = async (dossier: Dossier): Promise<string> => {
    try {
        const prompt = `
            You are an AI assistant for a busy contractor. Your task is to summarize the following property dossier into a few key, actionable bullet points. Focus on the most important information a contractor would need to know before a sales call.
            Highlight:
            1. Key financial indicators (equity, income).
            2. The property's age and likely need for renovation.
            3. The most promising project suggestion.
            4. Any potential red flags (like tax liens).
            Keep the summary very concise, using bullet points.

            Dossier:
            ${JSON.stringify(dossier, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text?.trim() ?? "Could not generate AI summary.";
    } catch (error) {
        console.error("Error summarizing dossier:", error);
        return "Could not generate AI summary.";
    }
};

export const chatWithDossier = async (dossier: Dossier, prompt: string, history: Content[]): Promise<string> => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a helpful AI assistant for a contractor. You have access to a detailed dossier about a property and its owner. Your role is to answer the contractor's questions based *only* on the information in the dossier provided below. If the answer isn't in the dossier, say that you don't have that information. Keep your answers concise and to the point.
        
                ---
                DOSSIER CONTEXT:
                ${JSON.stringify(dossier, null, 2)}
                ---
                `
            },
            history: history,
        });

        const response = await chat.sendMessage({ message: prompt });
        return response.text?.trim() ?? "I'm sorry, I encountered an error and can't respond right now.";
    } catch (error) {
        console.error("Error chatting with dossier:", error);
        return "I'm sorry, I encountered an error and can't respond right now.";
    }
};

export const generateOutreachMessage = async (dossier: Dossier, type: 'email' | 'sms', tone: string): Promise<string> => {
    try {
        const prompt = `
            Based on the following property dossier, draft an outreach ${type} to the homeowner, ${dossier.ownerName}.
            The tone should be ${tone}.
            The message should be concise and aim to schedule an initial consultation.
            Reference one of the AI-suggested projects if available to make the message more relevant.
            If it's an SMS, keep it very short (under 160 characters).
            If it's an email, include a clear subject line at the very beginning, like "Subject: Your Property at [Address]".
            Do NOT include placeholders like [Your Name] or [Your Company]. Just write the message body.

            Dossier:
            - Address: ${dossier.propertyDetails.lastSaleDate ? new Date(dossier.propertyDetails.lastSaleDate).getFullYear() : 'N/A'} build
            - Owner Age: ${dossier.demographics.estOwnerAgeRange}
            - Suggested Project: ${dossier.projectSuggestions?.[0]?.name || 'a potential home improvement project'}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an expert marketing copywriter for a home renovation contractor. Your task is to draft compelling, personalized outreach messages. Respond ONLY with the text of the message."
            }
        });

        return response.text?.trim() ?? "Sorry, I was unable to generate a message at this time. Please try again.";

    } catch (error) {
        console.error("Error generating outreach message:", error);
        return "Sorry, I was unable to generate a message at this time. Please try again.";
    }
};

export const generateProjectSuggestions = async (dossier: Dossier, industry?: string): Promise<ProjectSuggestion[]> => {
    try {
        const prompt = `Based on the following property dossier, suggest 3-4 high-impact renovation projects. For each suggestion, provide a concise data-driven reason, an estimated cost in USD, and an estimated Return on Investment (ROI) percentage. The suggestions should be tailored to the homeowner's demographics, property age, and financial details. ROI is calculated as (Increase in Home Value / Project Cost) * 100.

        **CRITICAL**: The contractor's primary industry is "${industry || 'General Contracting'}". Tailor your suggestions to be highly relevant to this specialty. For example, if the industry is 'Roofing', prioritize roofing-related projects. If it's 'General Contracting', provide a diverse range of suggestions.

        Dossier:
        - Owner Age: ${dossier.demographics.estOwnerAgeRange}
        - Household Income: ${dossier.demographics.estHouseholdIncome}
        - Life Stage: ${dossier.demographics.lifeStageProfile}
        - Property Value: ${dossier.estimatedValue}
        - Year Built: ${dossier.propertyDetails.yearBuilt}
        - Equity: Approximately ${dossier.estimatedValue - (dossier.mortgageDetails.estimatedRemainingBalance || dossier.mortgageDetails.originalLoanAmount)}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: projectSuggestionsSchema,
                systemInstruction: "You are an expert home renovation consultant AI. Your task is to analyze property and demographic data to recommend suitable renovation projects. Respond ONLY with the JSON array defined in the schema."
            }
        });
        
        const jsonText = response.text;
        if (!jsonText) {
            console.error("AI response was empty, returning empty suggestions array.");
            return [];
        }
        return JSON.parse(jsonText.trim());

    } catch (error) {
        console.error("Error generating project suggestions:", error);
        return []; // Return empty array on failure to not block the user flow
    }
};


export const generateDossier = async (address: string, industry?: string, coords?: { lat: number; lng: number }): Promise<{ dossier: Dossier, groundingChunks: GroundingChunk[] | undefined }> => {
  try {
    const modelConfig: any = {
      model: "gemini-2.5-flash",
      contents: `Gather up-to-date and accurate real-world property and demographic information for the US address: ${address}.`,
      config: {
        tools: [{googleSearch: {}}, {googleMaps: {}}],
        systemInstruction: `You are a real estate data aggregation AI. Your task is to find real-world information for a given US address.
        **Prioritize finding the following essential information first: 1. Homeowner demographics (age, income). 2. Mortgage details (lender, balance). 3. Recent building permits.**
        All other information is secondary. Also, attempt to find a publicly listed, business-related email address or phone number for the owner.`
      },
    };

    if (coords) {
        modelConfig.config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: coords.lat,
                    longitude: coords.lng
                }
            }
        };
    }

    const groundedResponse = await ai.models.generateContent(modelConfig);

    const context = groundedResponse.text;
    const groundingChunks = groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (!context) {
      throw new Error("Could not retrieve grounded information for the address.");
    }

    const jsonResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based ONLY on the following information, generate a property dossier. Do not invent any data not present in the provided text.\n\nInformation:\n${context}\n\nAddress: ${address}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: dossierSchema,
        systemInstruction: "You are an AI assistant for a real estate contractor app. Your task is to populate a 'Property Dossier' JSON object using only the information provided. If a piece of information is missing from the provided text, use a reasonable default or placeholder (e.g., 0 for numbers, 'N/A' for strings, false for booleans). Respond ONLY with the JSON object defined in the schema."
      },
    });

    const jsonText = jsonResponse.text;
    if (!jsonText) {
        throw new Error("AI failed to generate dossier JSON from context.");
    }
    const dossierData: Dossier = JSON.parse(jsonText.trim());

    // Generate project suggestions based on the new dossier
    const suggestions = await generateProjectSuggestions(dossierData, industry);
    dossierData.projectSuggestions = suggestions;
    
    return { dossier: dossierData, groundingChunks };
  } catch (error) {
    console.error("Error generating dossier:", error);
    throw new Error("Failed to generate property dossier. Please try again.");
  }
};

export const enrichDossier = async (dossier: Dossier, address: string, coords: { lat: number; lng: number }): Promise<{ dossier: Dossier, groundingChunks: GroundingChunk[] | undefined }> => {
    try {
        const groundedResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Perform a deep dive for the following US address: ${address}. Find information on: 1. The neighborhood's general 'vibe', walkability score, and perceived crime rate. 2. Ratings or reputation of the local school district. 3. General trends in recent building permits or renovation activity in the immediate area. 4. Try to find direct URLs to official public records for this property (e.g., County Auditor, Assessor, GIS map).`,
            config: {
                tools: [{googleSearch: {}}, {googleMaps: {}}],
                 toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: coords.lat,
                            longitude: coords.lng
                        }
                    }
                },
                systemInstruction: "You are a real estate data enrichment AI. Your task is to find specific, qualitative and quantitative neighborhood data to enrich a property dossier."
            },
        });

        const context = groundedResponse.text;
        const newGroundingChunks = groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (!context) {
             throw new Error("Could not retrieve enrichment information.");
        }

        const jsonResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based ONLY on the following additional information, update the provided property dossier JSON with neighborhood info, school ratings, recent permit summaries, and public record links. Merge this new data into the existing dossier structure.\n\nAdditional Information:\n${context}\n\nCurrent Dossier JSON:\n${JSON.stringify(dossier)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: dossierSchema,
                systemInstruction: "You are a data merging AI. Update the provided JSON object with the new information found in the text. Focus on populating 'neighborhoodInfo', 'schoolRatings', 'recentPermits', and 'publicRecordLinks'. Respond ONLY with the updated JSON object."
            },
        });

        const jsonText = jsonResponse.text;
        if (!jsonText) {
            throw new Error("AI failed to generate enriched dossier JSON.");
        }
        const updatedDossier: Dossier = JSON.parse(jsonText.trim());

        return { dossier: updatedDossier, groundingChunks: newGroundingChunks };

    } catch (error) {
        console.error("Error enriching dossier:", error);
        throw new Error("Failed to enrich dossier with new data.");
    }
}

export const enrichOwnerProfile = async (dossier: Dossier, address: string): Promise<{ dossier: Dossier, groundingChunks: GroundingChunk[] | undefined }> => {
     try {
        const prompt = `Find publicly available professional information for "${dossier.ownerName}" who owns the property at "${address}". Look for their likely job title, company, a summary of their public professional profile (like LinkedIn), and any notable community involvement. Also, try to find a publicly available, business-related email or phone number. Do NOT invade privacy; only use widely available public info.`;
        
        const groundedResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                systemInstruction: "You are a professional profile researcher AI. Find public business information about a homeowner to help a contractor understand their client better."
            },
        });

        const context = groundedResponse.text;
        const newGroundingChunks = groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (!context) {
             throw new Error("Could not retrieve owner profile information.");
        }

        const jsonResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based ONLY on the following text, populate the 'ownerProfile' section of the dossier JSON, including any contact details found.\n\nInformation:\n${context}\n\nCurrent Dossier JSON:\n${JSON.stringify(dossier)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: dossierSchema,
                systemInstruction: "You are a data merging AI. Update the JSON object by populating the 'ownerProfile' field based on the text provided. Respond ONLY with the updated JSON object."
            },
        });

        const jsonText = jsonResponse.text;
        if (!jsonText) {
            throw new Error("AI failed to generate owner profile JSON.");
        }
        const updatedDossier: Dossier = JSON.parse(jsonText.trim());

        return { dossier: updatedDossier, groundingChunks: newGroundingChunks };

    } catch (error) {
        console.error("Error enriching owner profile:", error);
        throw new Error("Failed to enrich owner profile.");
    }
};

export const getCoordsFromAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide the precise latitude and longitude for the following address in a JSON object with "lat" and "lng" keys: ${address}`,
      config: {
        tools: [{ googleMaps: {} }],
        systemInstruction: "You are a geocoding AI. Your only job is to return the latitude and longitude for a given address in a simple JSON format like {\"lat\": 34.05, \"lng\": -118.24}. Do not include any other text or markdown.",
      },
    });

    const rawJsonText = response.text;
    if (!rawJsonText) {
        throw new Error("Invalid response from geocoding AI.");
    }
    let jsonText = rawJsonText.trim();
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7);
    }
    if (jsonText.startsWith('```')) {
        jsonText = jsonText.substring(3);
    }
    if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
    }
    
    const coords = JSON.parse(jsonText);

    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        return coords;
    } else {
        throw new Error("Invalid coordinate format returned from AI.");
    }

  } catch (error) {
    console.error("Error getting coordinates from address:", error);
    throw new Error("Failed to geocode address. Please check the address and try again.");
  }
};

export const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the provided geographical coordinates, determine the most likely full street address. Respond ONLY with the street address string, without any preamble or extra text.`,
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            }
          }
        }
      },
    });

    const address = response.text?.trim();
    if (!address) {
        throw new Error("AI could not determine an address for the given coordinates.");
    }
    return address;

  } catch (error) {
    console.error("Error getting address from coordinates:", error);
    throw new Error("Failed to find address from location. Please try entering it manually.");
  }
};

export const generateQuoteLineItems = async (prompt: string): Promise<Omit<QuoteLineItem, 'id'>[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following project description, break it down into standard line items for a contractor's quote. Provide estimated quantities and typical US market prices.\n\nDescription: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: quoteLineItemsSchema,
                systemInstruction: "You are a quote generation assistant for a renovation contractor. Your task is to analyze a project description and create a structured list of line items with realistic quantities and prices in USD. Respond ONLY with the JSON array defined in the schema."
            }
        });

        const jsonText = response.text;
        if (!jsonText) {
            throw new Error("AI response was empty, expected quote line items JSON.");
        }
        const lineItems = JSON.parse(jsonText.trim());
        return lineItems;

    } catch (error) {
        console.error("Error generating quote line items:", error);
        throw new Error("Failed to generate line items with AI. Please try adding them manually.");
    }
};

export const generateVisualQuoteItems = async (prompt: string, images: { mimeType: string, data: string }[]): Promise<Omit<QuoteLineItem, 'id'>[]> => {
    try {
        const imageParts = images.map(image => ({
            inlineData: {
                mimeType: image.mimeType,
                data: image.data,
            },
        }));

        const textPart = {
            text: `You are a quote generation assistant for a renovation contractor. Based on the user's project description and the provided images, create a structured list of line items for a quote. Analyze the images to identify materials, approximate dimensions, and required labor steps. Provide estimated quantities and typical US market prices in USD.
            
            Project Description: "${prompt}"`
        };
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [textPart, ...imageParts] },
            config: {
                responseMimeType: "application/json",
                responseSchema: quoteLineItemsSchema,
                systemInstruction: "Respond ONLY with the JSON array defined in the schema."
            }
        });

        const jsonText = response.text;
        if (!jsonText) {
            throw new Error("AI response was empty, expected visual quote line items JSON.");
        }
        const lineItems = JSON.parse(jsonText.trim());
        return lineItems;

    } catch (error) {
        console.error("Error generating visual quote line items:", error);
        throw new Error("Failed to generate line items from images with AI. Please try adding them manually or adjust the prompt.");
    }
};

export const generateProjectPhases = async (projectDescription: string): Promise<{name: string, suggestedDurationDays: number}[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following project description, generate a list of typical construction phases and their estimated durations in days.\n\nDescription: "${projectDescription}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: projectPhasesSchema,
                systemInstruction: "You are a project management assistant for a renovation contractor. Your task is to break down a project into standard phases with realistic durations. Respond ONLY with the JSON array defined in the schema."
            }
        });

        const jsonText = response.text;
        if (!jsonText) {
            throw new Error("AI response was empty, expected project phases JSON.");
        }
        const phases = JSON.parse(jsonText.trim());
        return phases;

    } catch (error) {
        console.error("Error generating project phases:", error);
        throw new Error("Failed to generate project phases with AI.");
    }
};

export const generateChangeOrderDetails = async (description: string): Promise<Omit<ChangeOrder, 'id' | 'createdAt' | 'description' | 'total'>> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `A homeowner has requested a change to an ongoing project. Based on their request below, generate a professional scope of work and a list of line items with estimated costs.\n\nRequest: "${description}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: changeOrderSchema,
                systemInstruction: "You are a change order assistant for a renovation contractor. Create a scope of work and line items based on the user's request. Respond ONLY with the JSON object defined in the schema."
            }
        });

        const jsonText = response.text;
        if (!jsonText) {
            throw new Error("AI response was empty, expected change order details JSON.");
        }
        const details = JSON.parse(jsonText.trim());

        const lineItemsWithIds = (details.lineItems || []).map((item: Omit<QuoteLineItem, 'id'>) => ({ ...item, id: uuidv4() }));

        return {
            scopeOfWork: details.scopeOfWork,
            lineItems: lineItemsWithIds,
        };

    } catch (error) {
        console.error("Error generating change order details:", error);
        throw new Error("Failed to generate change order details with AI. Please try adding them manually.");
    }
};
import { useMemo } from 'react';

/**
 * useFlattenedLeads
 * Flattens and dedupes leads from either grouped (stageId/leads) or flat format.
 * @param {Array} leads - The leads array from redux (grouped or flat)
 * @returns {Array} - Flat, deduped array of leads
 */
export default function useFlattenedLeads(leads) {
  return useMemo(() => {
    const seen = new Set();
    let flatLeads = [];
    if (Array.isArray(leads) && leads.length > 0 && leads[0].stageId && Array.isArray(leads[0].leads)) {
      leads.forEach((stageGroup) => {
        if (Array.isArray(stageGroup.leads)) {
          flatLeads = flatLeads.concat(stageGroup.leads);
        }
      });
    } else if (Array.isArray(leads)) {
      flatLeads = leads;
    }
    return flatLeads.filter((lead) => {
      if (lead && lead.leadId && !seen.has(lead.leadId)) {
        seen.add(lead.leadId);
        return true;
      }
      return false;
    });
  }, [leads]);
} 
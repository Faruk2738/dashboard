'use client';

import { useMemo, useState } from 'react';

export default function useDashboardFilters(initialData) {
  const [filters, setFilters] = useState({ category: null, territory: null, product: null, rfmSegment: null });
  const toggle = (type, value) => {
    if (!value) return;
    setFilters((current) => {
      const isSameValue = current[type] === value;
      if (type === 'rfmSegment') return { category: null, territory: null, product: null, rfmSegment: isSameValue ? null : value };
      return { ...current, rfmSegment: null, [type]: isSameValue ? null : value };
    });
  };
  const clear = () => setFilters({ category: null, territory: null, product: null, rfmSegment: null });
  const key = useMemo(() => [
    filters.category && `category:${filters.category}`,
    filters.territory && `territory:${filters.territory}`,
    filters.product && `product:${filters.product}`,
    filters.rfmSegment && `segment:${filters.rfmSegment}`,
  ].filter(Boolean).join('|') || 'all', [filters]);
  const slice = initialData.interactiveSlices?.[key];
  return { data: { ...initialData, ...(slice || {}) }, filters, toggle, clear, isFiltered: key !== 'all' };
}

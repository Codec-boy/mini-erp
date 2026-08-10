import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../../types';

interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Showing page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} total records)
      </span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          className="btn btn-secondary btn-sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

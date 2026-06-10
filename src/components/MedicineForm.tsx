import React, { useState } from 'react';
import { createMedicine, updateMedicine, Medicine } from '../lib/inventory';

interface MedicineFormProps {
  inventoryId: string;
  onSubmit: () => void;
  onCancel: () => void;
  initialMedicine?: Medicine | null;
}

const MedicineForm: React.FC<MedicineFormProps> = ({
  inventoryId,
  onSubmit,
  onCancel,
  initialMedicine,
}) => {
  const [formData, setFormData] = useState({
    name: initialMedicine?.name || '',
    category: initialMedicine?.category || 'Pill',
    quantity: initialMedicine?.quantity || 0,
    threshold: initialMedicine?.threshold || 0,
    expiry_date: initialMedicine?.expiry_date || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (initialMedicine) {
        // Update existing medicine
        await updateMedicine(initialMedicine.id, {
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          threshold: formData.threshold,
          expiry_date: formData.expiry_date || undefined,
        });
      } else {
        // Create new medicine
        await createMedicine(
          inventoryId,
          formData.name,
          formData.category,
          formData.quantity,
          formData.threshold,
          formData.expiry_date || undefined
        );
      }

      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-700/50 bg-slate-950/90 p-6 space-y-5 shadow-xl shadow-slate-950/10">
      <h3 className="text-lg font-semibold text-slate-100 tracking-tight">
        {initialMedicine ? 'Edit Medicine' : 'Add New Medicine'}
      </h3>

      {error && (
        <div className="bg-rose-950 border border-rose-700 text-rose-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-1">
          Medicine Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-2xl border border-slate-700/60 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-200 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-900 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="Pill">Pill</option>
            <option value="Syrup">Syrup</option>
            <option value="First Aid">First Aid</option>
            <option value="Injection">Injection</option>
            <option value="Cream">Cream</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-slate-200 mb-1">
            Current Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-900 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label htmlFor="threshold" className="block text-sm font-medium mb-1">
            Low Stock Threshold
          </label>
          <input
            type="number"
            id="threshold"
            name="threshold"
            value={formData.threshold}
            onChange={handleChange}
            min="0"
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-900 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="expiry_date" className="block text-sm font-medium text-slate-200 mb-1">
          Expiry Date (Optional)
        </label>
        <input
          type="date"
          id="expiry_date"
          name="expiry_date"
          value={formData.expiry_date}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-700/60 bg-slate-900 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-2xl border border-slate-700/60 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialMedicine ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default MedicineForm;

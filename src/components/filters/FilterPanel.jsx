import { Select } from 'antd';
import { CATEGORIES, TIME_FILTERS, DIFFICULTIES } from '../../utils/constants';

export default function FilterPanel({ filters, onChange, sortOption, onSortChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        placeholder="Категория"
        value={filters.category || undefined}
        onChange={(value) => onChange({ ...filters, category: value })}
        className="w-40"
        allowClear
      >
        {CATEGORIES.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
      </Select>

      <Select
        placeholder="Время"
        value={filters.time || undefined}
        onChange={(value) => onChange({ ...filters, time: value })}
        className="w-40"
        allowClear
      >
        {TIME_FILTERS.map(t => <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>)}
      </Select>

      <Select
        placeholder="Сложность"
        value={filters.difficulty || undefined}
        onChange={(value) => onChange({ ...filters, difficulty: value })}
        className="w-40"
        allowClear
      >
        {DIFFICULTIES.map(d => <Select.Option key={d} value={d}>{d}</Select.Option>)}
      </Select>

      <Select
        placeholder="Сортировка"
        value={sortOption || undefined}
        onChange={onSortChange}
        className="w-44"
        allowClear
      >
        <Select.Option value="time">По времени</Select.Option>
        <Select.Option value="difficulty">По сложности</Select.Option>
      </Select>
    </div>
  );
}

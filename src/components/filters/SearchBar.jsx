import { Input } from 'antd';

export default function SearchBar({ value, onChange }) {
  return (
    <Input.Search
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Поиск по названию..."
      allowClear
      className="w-full md:w-80"
    />
  );
}

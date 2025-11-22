import { Checkbox } from 'antd';

export default function ProductRow({ item, checked, onToggle }) {
  return (
    <tr>
      <td>
        <Checkbox checked={checked} onChange={() => onToggle(item.id)} />
      </td>
      <td>{item.name}</td>
      <td>{item.quantity}</td>
      <td>{item.unit}</td>
    </tr>
  );
}

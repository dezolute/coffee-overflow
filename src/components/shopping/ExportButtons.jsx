import { Button } from 'antd';

export default function ExportButtons({ items }) {
  const exportTxt = () => {
    const content = items.map(i => `${i.name} — ${i.quantity} ${i.unit}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'shopping-list.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button onClick={exportTxt} className="btn-accent">Экспорт TXT</Button>
    </div>
  );
}

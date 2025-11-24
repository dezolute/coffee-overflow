import Navbar from '../layout/Navbar';
import { useContext } from 'react';
import { ShoppingContext } from '../../context/ShoppingContext';
import StockForm from '../stock/StockForm';
import StockTable from '../stock/StockTable';
import { Button } from 'antd';

export default function StockPage() {
  const { stock, addStockItem, removeStockItem, clearStock } = useContext(ShoppingContext);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2 className="page-title">📦 Учёт запасов</h2>
        <StockForm onAdd={addStockItem} />
        <div className="section-gap">
          <StockTable stock={stock} onRemove={removeStockItem} />
        </div>
        <div className="section-gap">
          <Button danger onClick={clearStock}>Очистить запасы</Button>
        </div>
      </div>
    </div>
  );
}

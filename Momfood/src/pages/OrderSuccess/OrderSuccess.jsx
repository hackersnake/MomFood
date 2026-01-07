import React, { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const OrderSuccess = () => {
  const { token } = useContext(StoreContext);
  const query = useQuery();
  const orderId = query.get('orderId');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (orderId && token) {
      fetch(`http://localhost:8080/api/orders/${orderId}`, { headers: { 'X-Auth-Token': token } })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch order');
        })
        .then(data => setOrder(data))
        .catch(err => setError(err.message));
    }
  }, [orderId, token]);

  const downloadReceipt = async () => {
    if (!orderId) return;
    setDownloading(true); setError(null);
    try {
      const r = await fetch(`http://localhost:8080/api/orders/${orderId}/receipt`, { headers: { 'X-Auth-Token': token } });
      if (!r.ok) { const d = await r.json(); setError(d.error || 'Failed to download'); setDownloading(false); return }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `receipt-${orderId}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setDownloading(false);
    } catch (e) { setError('Network error'); setDownloading(false); }
  }

  const handlePayment = async (method) => {
    setPaying(true); setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ method })
      });
      const data = await res.json();
      if (res.ok) {
        setOrder({ ...order, paymentStatus: 'PAID' }); // Optimistic update or fetch again
      } else {
        setError(data.error || 'Payment failed');
      }
      setPaying(false);
    } catch (e) { setError('Network error'); setPaying(false); }
  }

  if (!orderId) return <div>Invalid Order ID</div>;
  if (!order) return <div>Loading order details...</div>;

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      {order.paymentStatus !== 'PAID' ? (
        <div>
          <h2>Order Created!</h2>
          <p>Your order #{orderId} is pending payment.</p>
          <p>Total: <b>${order.totalAmount}</b></p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={() => handlePayment('ONLINE')} disabled={paying} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4caf50', color: 'white', border: 'none' }}>
              {paying ? 'Processing...' : 'Pay Online (Simulate)'}
            </button>
            <button onClick={() => handlePayment('COD')} disabled={paying} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#2196f3', color: 'white', border: 'none' }}>
              {paying ? 'Processing...' : 'Pay with Cash'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 style={{ color: 'green' }}>Payment Successful!</h2>
          <p>Your order #{orderId} has been placed.</p>
          <p style={{ marginBottom: 20 }}>Thank you for ordering with MomFood.</p>
          <button onClick={downloadReceipt} disabled={downloading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            {downloading ? 'Downloading...' : 'Download Bill'}
          </button>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 20 }}>{error}</div>}
    </div>
  )
}

export default OrderSuccess

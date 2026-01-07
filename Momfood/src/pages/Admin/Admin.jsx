import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../context/StoreContext'
import './Admin.css'

const Admin = () => {
    const { token, fetchFoodList } = useContext(StoreContext);
    const [activeTab, setActiveTab] = useState('add-item'); // add-item, add-category, orders
    const [categories, setCategories] = useState([]);

    const [editItem, setEditItem] = useState(null);

    // Fetch categories on mount (needed for multiple tabs)
    useEffect(() => {
        if (!token) return;
        fetch('http://localhost:8080/api/admin/categories', { headers: { 'X-Auth-Token': token } })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
                else setCategories([]);
            })
            .catch(() => setCategories([]));
    }, [token, activeTab]); // Refresh when tab changes to keep valid

    const handleEdit = (item) => {
        setEditItem(item);
        setActiveTab('add-item');
    }

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h3>Admin Panel</h3>
                <div className={`sidebar-option ${activeTab === 'add-item' ? 'active' : ''}`} onClick={() => { setActiveTab('add-item'); setEditItem(null); }}>
                    <span>{editItem ? 'Edit Item' : 'Add Item'}</span>
                </div>
                <div className={`sidebar-option ${activeTab === 'add-category' ? 'active' : ''}`} onClick={() => setActiveTab('add-category')}>
                    <span>Categories</span>
                </div>
                <div className={`sidebar-option ${activeTab === 'list-items' ? 'active' : ''}`} onClick={() => setActiveTab('list-items')}>
                    <span>List Items</span>
                </div>
                <div className={`sidebar-option ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                    <span>Orders</span>
                </div>
            </div>

            <div className="admin-content">
                {activeTab === 'add-item' && <AddItem token={token} categories={categories} fetchFoodList={fetchFoodList} editItem={editItem} setEditItem={setEditItem} />}
                {activeTab === 'add-category' && <AddCategory token={token} onCategoryAdded={(c) => setCategories([...categories, c])} />}
                {activeTab === 'list-items' && <ListItems token={token} fetchFoodList={fetchFoodList} onEdit={handleEdit} />}
                {activeTab === 'orders' && <OrdersList token={token} />}
            </div>
        </div>
    )
}

const AddItem = ({ token, categories, fetchFoodList, editItem, setEditItem }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageData, setImageData] = useState('');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (editItem) {
            setName(editItem.name || '');
            setPrice(editItem.price || '');
            setDescription(editItem.description || '');
            // find category id from name or object
            if (editItem.category) {
                const cat = categories.find(c => c.name === editItem.category.name || c.id === editItem.category.id);
                if (cat) setCategoryId(cat.id);
            }
            // we don't necessarily have image data in base64, so we might just show a preview reference or leave it
            // if we want to preview the existing url:
            setImageData(editItem.imageUrl || '');
        } else {
            setName(''); setPrice(''); setDescription(''); setCategoryId(''); setImageData('');
        }
    }, [editItem, categories]);

    const onFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1024 * 1024) { setMessage({ type: 'error', text: 'Image max size 1MB' }); return; }

        const reader = new FileReader();
        reader.onload = () => setImageData(reader.result);
        reader.readAsDataURL(file);
    };

    const submit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!name || !price || !categoryId) { setMessage({ type: 'error', text: 'All fields are required' }); return; }

        try {
            const url = editItem
                ? `http://localhost:8080/api/admin/food/${editItem.id}`
                : 'http://localhost:8080/api/admin/food';

            const method = editItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
                body: JSON.stringify({
                    name,
                    price: Number(price),
                    categoryId: Number(categoryId),
                    description,
                    imageUrl: imageData
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: editItem ? 'Item Updated!' : 'Food Item Added Successfully!' });
                if (!editItem) {
                    setName(''); setPrice(''); setDescription(''); setCategoryId(''); setImageData('');
                }
                fetchFoodList(); // Refresh global food list
                if (editItem) {
                    // Optional: could exit edit mode here, but maybe user wants to continue editing?
                    // setEditItem(null); 
                }
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed' });
            }
        } catch (err) { setMessage({ type: 'error', text: 'Network Error' }); }
    }

    if (categories.length === 0) {
        return (
            <div className="admin-form-card" style={{ textAlign: 'center' }}>
                <h3>No Categories Found</h3>
                <p>You must create a category before adding items.</p>
            </div>
        )
    }

    return (
        <div>
            <div className="content-header">
                <h2>{editItem ? 'Edit Food Item' : 'Add Food Item'}</h2>
                {editItem && <button onClick={() => setEditItem(null)} style={{ fontSize: '0.9rem', cursor: 'pointer', padding: '4px 8px', marginLeft: 10 }}>Cancel Edit</button>}
            </div>
            {message && <div className={`status-msg ${message.type === 'error' ? 'error' : 'success'}`}>{message.text}</div>}

            <form onSubmit={submit} className="admin-form-card">
                <div className="form-group">
                    <label>Upload Image</label>
                    <div className="upload-area">
                        <label htmlFor="file-upload" className="upload-label">
                            {imageData ? "Change Image" : "Click to upload image"}
                        </label>
                        <input id="file-upload" type="file" accept="image/*" onChange={onFile} hidden />
                        {imageData && <img src={imageData} alt="Preview" className="preview-image" />}
                    </div>
                </div>

                <div className="form-group">
                    <label>Product Name</label>
                    <input className="admin-input" value={name} onChange={e => setName(e.target.value)} placeholder="Type name here" required />
                </div>

                <div className="form-group">
                    <label>Product Description</label>
                    <textarea className="admin-textarea" rows="4" value={description} onChange={e => setDescription(e.target.value)} placeholder="Write content here" />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Category</label>
                        <select className="admin-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Price ($)</label>
                        <input className="admin-input" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="20" required />
                    </div>
                </div>

                <button type="submit" className="submit-btn">{editItem ? 'UPDATE' : 'ADD'}</button>
            </form>
        </div>
    )
}

const AddCategory = ({ token, onCategoryAdded }) => {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [message, setMessage] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!name) { setMessage({ type: 'error', text: 'Category name required' }); return; }

        try {
            const res = await fetch('http://localhost:8080/api/admin/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
                body: JSON.stringify({ name, imageUrl: image })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Category Created!' });
                onCategoryAdded(data);
                setName(''); setImage('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed' });
            }
        } catch (err) { setMessage({ type: 'error', text: 'Network Error' }); }
    }

    return (
        <div>
            <div className="content-header">
                <h2>Add Category</h2>
            </div>
            {message && <div className={`status-msg ${message.type === 'error' ? 'error' : 'success'}`}>{message.text}</div>}

            <form onSubmit={submit} className="admin-form-card">
                <div className="form-group">
                    <label>Category Name</label>
                    <input className="admin-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Salad, Deserts" required />
                </div>
                <div className="form-group">
                    <label>Image URL (Optional)</label>
                    <input className="admin-input" value={image} onChange={e => setImage(e.target.value)} placeholder="http://..." />
                </div>
                <button type="submit" className="submit-btn" style={{ marginTop: 0 }}>Create Category</button>
            </form>
        </div>
    )
}

const ListItems = ({ token, fetchFoodList, onEdit }) => {
    const [list, setList] = useState([]);

    const fetchList = async () => {
        const response = await fetch("http://localhost:8080/api/food");
        const data = await response.json();
        setList(data);
    }

    useEffect(() => {
        fetchList();
    }, []);

    const removeFood = async (foodId) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        const response = await fetch(`http://localhost:8080/api/admin/food/${foodId}`, {
            method: 'DELETE',
            headers: { 'X-Auth-Token': token }
        });
        if (response.ok) {
            await fetchList();
            fetchFoodList(); // Refresh global context
        } else {
            alert("Error removing item");
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="content-header"><h2>All Food Items</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {list.map((item, index) => {
                    return (
                        <div key={index} className='order-card' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <img src={item.imageUrl} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ marginTop: 10, fontWeight: 'bold' }}>{item.name}</div>
                                <div style={{ color: '#666' }}>${item.price} - {item.category?.name}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                <button
                                    onClick={() => onEdit(item)}
                                    style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => removeFood(item.id)}
                                    style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const OrdersList = ({ token }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/orders/all', { headers: { 'X-Auth-Token': token } })
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setOrders(data) : setOrders([]))
            .catch(() => setOrders([]));
    }, [token]);

    if (orders.length === 0) return <div className="status-msg">No orders found.</div>;

    return (
        <div>
            <div className="content-header"><h2>All Orders</h2></div>
            <div className="orders-grid">
                {orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <div><strong>Order ID:</strong> #{order.id}</div>
                            <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-pending'}`}>
                                {order.paymentStatus}
                            </span>
                        </div>
                        <p><strong>User:</strong> {order.user}</p>
                        <p><strong>Amount:</strong> ${order.total}</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>{order.createdAt}</p>
                        <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                            <small>Status: {order.status}</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Admin

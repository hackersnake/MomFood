import React, { createContext, useEffect, useState } from "react";
import { food_list as local_food_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [food_list, setFoodList] = useState(local_food_list);
    const [categoryList, setCategoryList] = useState([]); // New state for categories
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('mf_user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('mf_token') || null);

    const fetchFoodList = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/food");
            if (!res.ok) throw new Error("Network response not ok");
            const data = await res.json();
            const transformed = data.map((item) => ({
                _id: item.id ? item.id.toString() : "",
                name: item.name || "",
                image: item.imageUrl || "",
                price: item.price || 0,
                description: item.description || "",
                category: item.category && item.category.name ? item.category.name : (item.category || "")
            }));
            setFoodList(transformed);
        } catch (error) {
            console.error("Failed to fetch food list:", error);
            // keep local fallback if empty
            if (food_list.length === 0) setFoodList(local_food_list);
        }
    };

    const fetchCategoryList = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/categories");
            if (!res.ok) throw new Error("Network response not ok");
            const data = await res.json();
            // Transform matches if needed, assuming backend returns {id, name, imageUrl}
            setCategoryList(data);
        } catch (error) {
            console.error("Failed to fetch category list:", error);
        }
    };

    useEffect(() => {
        fetchFoodList();
        fetchCategoryList();
    }, []);

    const addToCart = (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }

    const [search, setSearch] = useState("");

    const contextValue = {
        fetchFoodList,
        food_list,
        categoryList, // Expose categoryList
        user,
        token,
        cartItems,
        addToCart,
        removeFromCart,
        setCartItems,
        signup: async (name, email, password, role) => {
            const res = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('mf_token', data.token);
                localStorage.setItem('mf_user', JSON.stringify(data.user));
            }
            return { ok: res.ok, data };
        },
        login: async (email, password) => {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('mf_token', data.token);
                localStorage.setItem('mf_user', JSON.stringify(data.user));
            }
            return { ok: res.ok, data };
        },
        logout: () => {
            setToken(null);
            setUser(null);
            localStorage.removeItem('mf_token');
            localStorage.removeItem('mf_user');
        },
        placeOrder: async (deliveryAddress) => {
            if (!token) return { ok: false, error: 'not authenticated' };
            const items = Object.keys(cartItems).filter(k => cartItems[k] > 0).map(k => ({ foodItemId: Number(k), quantity: cartItems[k] }));
            if (items.length === 0) return { ok: false, error: 'cart empty' };
            const res = await fetch('http://localhost:8080/api/orders', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
                body: JSON.stringify({ items, deliveryAddress })
            });
            const data = await res.json();
            if (!res.ok) return { ok: false, data };
            // clear cart on success
            setCartItems({});
            return { ok: true, data };
        },
        getTotalCartAmount,
        search,
        setSearch
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;

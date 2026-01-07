import React, { useState, useContext } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const LoginPopup = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState("Login")
    const { signup, login } = useContext(StoreContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (currState === 'Sign Up') {
            const role = isAdmin ? 'ADMIN' : 'CUSTOMER';
            const res = await signup(name, email, password, role);
            if (res.ok) setShowLogin(false); else setError(res.data?.error || 'Signup failed');
        } else {
            const res = await login(email, password);
            if (res.ok) setShowLogin(false); else setError(res.data?.error || 'Login failed');
        }
    };

    return (
        <div className='login-popup'>
            <form className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Login" ? <></> : <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder='your name' required />}
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder='your email' required />
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder='password' required />
                </div>
                <button onClick={handleSubmit}>{currState === "Sign Up" ? "Create account" : "Login"}</button>
                {currState === "Sign Up" && (
                    <div className="login-popup-condition" style={{ marginTop: 10 }}>
                        <input type="checkbox" id="adminCheck" onChange={(e) => setIsAdmin(e.target.checked)} />
                        <label htmlFor="adminCheck" style={{ marginLeft: 5 }}>Register as Admin</label>
                    </div>
                )}
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <div className="login-popup-condition">
                    <input type="checkbox" name="" id="" required />
                    <p>By continuing, I Agree to the terms of use & privacy policy</p>
                </div>
                {
                    currState === "Login"
                        ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click Here</span> </p>
                        : <p>Already have a account <span onClick={() => setCurrState("Login")}>Login Here</span > </p>

                }
            </form>
        </div>
    )
}

export default LoginPopup
import {} from 'react'
import NavBar from '../../components/NavBar'
import './loginpage.css'

function LoginPage() {
    return (
        <div>
            <NavBar isVisible={false}/>
            <div className="main">
                <div className="login-container">
                    <div className="login-title">Login</div>
                    <div className="login-divider"></div>

                    <div className="input-group">
                        <input type="text" placeholder="Username"/>
                        <input type="password" placeholder="Password"/>
                    </div>

                    <button className="login-button">Login</button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage
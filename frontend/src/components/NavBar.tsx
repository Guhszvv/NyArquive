import { FaGear, FaBook } from "react-icons/fa6";
import './NavBar.css';

type NavBarProps = {
  isVisible: boolean;
  isViewer: boolean;
};

function NavBar({ isVisible, isViewer}: NavBarProps) {
  return (
    <div className='navbar'>
      <FaBook />
      <h1 className='navbartitle'>NyArquive</h1>
      <div className="center">
        {isViewer && (
          <>
            
          </>
        )}
      </div>
      <div className='right'>
        {isVisible && (
          <button className='configbutton'>
            <FaGear />
          </button>
        )}
      </div>
    </div>
  );
}

export default NavBar;
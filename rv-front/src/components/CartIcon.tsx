import { type FC } from 'react';
import './CartIcon.css';

interface Props {
  count: number;
  onClick: () => void;
  disabled?: boolean;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CartIcon: FC<Props> = ({ 
  count, 
  onClick, 
  disabled = false,
  showCount = true,
  size = 'md'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'cart-icon-sm';
      case 'lg': return 'cart-icon-lg';
      default: return 'cart-icon-md';
    }
  };

  return (
    <div 
      className={`cart-icon-wrapper ${getSizeClass()}`}
      onClick={disabled ? undefined : onClick}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      {/* SVG иконка корзины */}
      <svg width="38" height="34" viewBox="0 0 38 34" fill="none">
        <path d="M24 32H26.5V33.25H11.5V32H14L15.25 28.25H22.75L24 32ZM37.75 0.75V27H0.25V0.75H37.75ZM35.25 3.25H2.75V24.5H35.25V3.25ZM34 23.25H4V4.5H34V23.25ZM7.75 9.5H17.75V8.25H7.75V9.5ZM12.75 18.25H7.75V19.5H12.75V18.25ZM22.75 15.75H11.5V17H22.75V15.75ZM22.75 13.25H11.5V14.5H22.75V13.25ZM24 10.75H11.5V12H24V10.75Z" 
          fill="#111918"/>
      </svg>
      
      {/* Бейдж с количеством */}
      {showCount && count > 0 && (
        <div className="cart-badge">
          {count}
        </div>
      )}
    </div>
  );
};
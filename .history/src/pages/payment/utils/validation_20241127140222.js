// E:\Steam\steam-website\src\pages\payment\utils\validation.js
export const validateCardNumber = (number) => {
    const regex = /^[0-9]{16}$/;
    return regex.test(number.replace(/\s/g, ''));
  };
  
  export const validateExpiry = (expiry) => {
    if (!expiry) return false;
    
    const [month, year] = expiry.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(year, 10);
    
    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
    
    return expiryMonth >= 1 && expiryMonth <= 12;
  };
  
  export const validateCVV = (cvv) => {
    const regex = /^[0-9]{3,4}$/;
    return regex.test(cvv);
  };
  
  export const validateName = (name) => {
    return name.trim().length >= 2;
  };
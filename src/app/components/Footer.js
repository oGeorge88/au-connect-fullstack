const Footer = () => {
  const currentYear = new Date().getFullYear(); // Dynamically get the current year

  return (
    <footer className="bg-red-600 text-white text-center py-4 mt-10 fixed bottom-0 left-0 w-full">
      <p>&copy; {currentYear} AU Connect. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;

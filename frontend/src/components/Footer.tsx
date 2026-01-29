const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-6 py-6 text-center text-gray-600">
        <p className="text-sm">© {new Date().getFullYear()} EcoWheels. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

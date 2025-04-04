const Footer = () => (
    <footer className="relative bg-gray-700 text-white py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between">
        <div>
          <h3 className="text-xl font-heading font-semibold tracking-wide mb-4">Quick Links</h3>
          <ul className="font-modern space-y-2 text-lg">
            <li className="hover:text-gray-300 transition-colors">Home</li>
            <li className="hover:text-gray-300 transition-colors">About</li>
            <li className="hover:text-gray-300 transition-colors">Features</li>
            <li className="hover:text-gray-300 transition-colors">Contact</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-heading font-semibold tracking-wide mb-4">Follow Us</h3>
          <ul className="flex space-x-6 font-modern text-lg">
            <li className="hover:text-gray-300 transition-colors">Twitter</li>
            <li className="hover:text-gray-300 transition-colors">Facebook</li>
            <li className="hover:text-gray-300 transition-colors">LinkedIn</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-heading font-semibold tracking-wide mb-4">Subscribe</h3>
          <input
            type="email"
            placeholder="Your email"
            className="p-3 rounded bg-gray-800 font-modern text-lg"
          />
        </div>
      </div>
    </footer>
  );
  
  export default Footer;
  
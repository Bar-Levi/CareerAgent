const Footer = () => (
    <footer className="relative bg-gray-700 text-white py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between">
        <div>
          <h3 className="text-lg font-bold">Quick Links</h3>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Features</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold">Follow Us</h3>
          <ul className="flex space-x-4">
            <li>Twitter</li>
            <li>Facebook</li>
            <li>LinkedIn</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold">Subscribe</h3>
          <input
            type="email"
            placeholder="Your email"
            className="p-2 rounded bg-gray-800"
          />
        </div>
      </div>
    </footer>
  );
  
  export default Footer;
  


export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-bold text-slate-900 tracking-tight block mb-4">ShopSense</span>
            <p className="text-sm text-slate-500">
              Your premium destination for modern technology and accessories.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">All Products</a></li>
              <li><a href="#" className="hover:text-indigo-600">Electronics</a></li>
              <li><a href="#" className="hover:text-indigo-600">Wearables</a></li>
              <li><a href="#" className="hover:text-indigo-600">Accessories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Contact Us</a></li>
              <li><a href="#" className="hover:text-indigo-600">FAQs</a></li>
              <li><a href="#" className="hover:text-indigo-600">Shipping Returns</a></li>
              <li><a href="#" className="hover:text-indigo-600">Order Tracking</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-12 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} ShopSense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

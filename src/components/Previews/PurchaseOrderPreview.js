import React from 'react';
import { FaTimes } from 'react-icons/fa';

const PurchaseOrderPreview = ({ poData, onClose }) => {

  const {
    poNumber,
    purchaseOrderNumber,
    orderDate,
    purchaseOrderDate,
    deliveryDate,
    purchaseOrderDeliveryDate,
    vendor,
    company,
    shippingAddress,
    items,
    notes
  } = poData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full relative m-4" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <FaTimes size={20} />
        </button>
        
        <div className="max-h-[85vh] overflow-y-auto p-2">
            {/* Header */}
            <header className="flex justify-between items-start pb-6 border-b">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-gray-800">PURCHASE ORDER</h1>
                    <p className="text-gray-500">PO #: {poNumber || purchaseOrderNumber}</p>
                </div>
            </header>

            {/* PO Details */}
            <section className="grid grid-cols-3 gap-8 py-6 border-b">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Vendor</h3>
                    <p className="font-bold text-gray-800">{vendor?.vendorName || vendor?.name || 'N/A'}</p>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                        {vendor?.addressLine1 || vendor?.address || ''}
                        {vendor?.addressLine2 && <br />}{vendor?.addressLine2}
                        {vendor?.city && <br />}{vendor?.city}
                        {vendor?.state && <br />}{vendor?.state}
                        {vendor?.pincode && <br />}{vendor?.pincode}
                        {vendor?.gstin && <><br />GSTIN: {vendor?.gstin}</>}
                    </p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Ship To</h3>
                    <p className="font-bold text-gray-800">{company?.name || 'N/A'}</p>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                        {shippingAddress || company?.regAdd || company?.address || 'N/A'}
                    </p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Details</h3>
                    <div className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">Order Date:</span>
                        <span className="text-gray-800 font-medium">{orderDate || purchaseOrderDate}</span>
                        <span className="text-gray-500">Delivery Date:</span>
                        <span className="text-gray-800 font-medium">{deliveryDate || purchaseOrderDeliveryDate}</span>
                    </div>
                </div>
            </section>

            {/* Items Table */}
            <section className="py-6">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 font-semibold text-gray-600">Item</th>
                            <th className="p-3 font-semibold text-gray-600">Description</th>
                            <th className="p-3 font-semibold text-gray-600 text-right">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items && items.length > 0 ? (
                            items.map(item => (
                                <tr key={item.id || Math.random()} className="border-b">
                                    <td className="p-3">{item.itemName || 'N/A'}</td>
                                    <td className="p-3 text-gray-600">{item.description || 'N/A'}</td>
                                    <td className="p-3 text-right">{item.quantity || 0} {item.uom || item.unit || ''}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="p-3 text-center text-gray-500">No items found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
            


            {/* Notes */}
            {notes && (
                <section className="pt-6 mt-6 border-t">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{notes}</p>
                </section>
            )}

            {/* Footer */}
            <footer className="text-center pt-8 mt-8 border-t text-xs text-gray-400">
                <p>This is a computer-generated document. No signature is required.</p>
                <p>{company?.name || 'Your Company'} | Thank you for your business!</p>
            </footer>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderPreview;
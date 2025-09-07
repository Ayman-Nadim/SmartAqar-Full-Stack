import React from 'react';
import { Send, Copy, CheckCircle } from 'lucide-react';

const BulkMessagePanel = ({ 
  messageTemplates, 
  selectedTemplate, 
  setSelectedTemplate,
  sendBulkMessages,
  sendingBulk,
  prospectsCount 
}) => {
  const selectedMsg = messageTemplates.find(t => t.id === selectedTemplate)?.message;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Send Bulk Messages</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Message Template
          </label>
          <div className="space-y-3">
            {messageTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-100'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <div className="flex items-center gap-2">
                    {selectedTemplate === template.id && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(template.message);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      title="Copy template"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.message.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Preview and Send */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            WhatsApp Message Preview
          </label>
          
          {/* Phone Frame with realistic WhatsApp UI */}
          <div className="relative mx-auto w-72 h-[500px] bg-gray-50 rounded-[2.5rem] border-[14px] border-black shadow-2xl flex flex-col overflow-hidden mb-4">
            {/* Phone notch */}
            <div className="h-5 w-32 bg-black rounded-b-lg mx-auto"></div>
            
            {/* WhatsApp header */}
            <div className="bg-[#202C33] px-4 py-3 flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0"></div>
              <div className="ml-3 flex-1">
                <div className="text-white font-medium text-sm">Prospect</div>
                <div className="text-xs text-[#8696A0]">online</div>
              </div>
              <div className="flex gap-3 text-[#AEBAC1]">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path>
                </svg>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path>
                </svg>
              </div>
            </div>

            {/* Chat area with realistic WhatsApp background */}
            <div className="flex-1 bg-[#0B141A] p-2 overflow-y-auto" style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZic+IDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpPC94bXA6Q3JlYXRvclRvb2w+IDx4bXA6Q3JlYXRlRGF0ZT4yMDE5LTAxLTI4VDEyOjU2OjM0KzAxOjAwPC94bXA6Q3JlYXRlRGF0ZT4gPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDpjY2M2NmIzNy1hY2Q1LTQ3Y2YtODhiMi1lMjJmYzk0YjE0M2M8L3htcE1NOkluc3RhbmNlSUQ+IDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6Y2NjNjZiMzctYWNkNS00N2NmLTg4YjItZTIyZmM5NGIxNDNjPC94bXBNTTpEb2N1bWVudElEPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv6lcBIAAABFSURBVHjaYvz//z8DIyZgZGRkAKrxB2LcCkH4PwjQpJCRgVJAtUJGBioAqAoZqQGoVsiED8M1kqyQZIX4MCMjIxMA+I8GNAgwAAMAEicKASXj9sYAAAAASUVORK5CYII=")' }}>
              {selectedMsg ? (
                <div className="flex flex-col space-y-1">
                  {/* Incoming message (example) */}
                  <div className="flex justify-start mb-2">
                    <div className="bg-[#202C33] text-white px-3 py-2 rounded-lg rounded-bl-none max-w-[80%] text-sm">
                      Hello! How can I help you?
                    </div>
                  </div>
                  
                  {/* Outgoing message (your template) */}
                  <div className="flex justify-end mb-3">
                    <div className="bg-[#005C4B] text-white px-3 py-2 rounded-lg rounded-br-none max-w-[80%] text-sm shadow-md">
                      {selectedMsg}
                    </div>
                  </div>
                  
                  {/* Message time */}
                  <div className="flex justify-end -mt-2 mb-4">
                    <span className="text-xs text-[#8696A0] mr-1">12:05 PM</span>
                    <svg viewBox="0 0 16 15" width="16" height="15" className="text-[#8696A0]">
                      <path fill="currentColor" d="M9.75 7.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm-4.5 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm8.25 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z"></path>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-[#202C33] rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg viewBox="0 0 24 24" width="30" height="30" className="text-[#8696A0]">
                        <path fill="currentColor" d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"></path>
                      </svg>
                    </div>
                    <p className="text-[#8696A0] text-sm mt-2">
                      Select a template to preview the message
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp input area */}
            <div className="bg-[#202C33] px-3 py-2 flex items-center">
              <div className="flex gap-2 text-[#8696A0] mr-2">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 20.664a9.163 9.163 0 0 1-6.521-2.702.977.977 0 0 1 0-1.416.99.99 0 0 1 1.416 0 7.26 7.26 0 0 0 10.209 0 .99.99 0 0 1 1.416 0 .977.977 0 0 1 0 1.416A9.163 9.163 0 0 1 12 20.664zm7.965-6.112a.977.977 0 0 1-.699-1.667 5.688 5.688 0 0 0 0-8.083.977.977 0 0 1 0-1.416.99.99 0 0 1 1.416 0 7.626 7.626 0 0 1 0 10.915.99.99 0 0 1-.717.251zM4.035 14.552a.99.99 0 0 1-.717-.251 7.626 7.626 0 0 1 0-10.915.99.99 0 0 1 1.416 0 .977.977 0 0 1 0 1.416 5.688 5.688 0 0 0 0 8.083.977.977 0 0 1 0 1.416.99.99 0 0 1-.699.251z"></path>
                </svg>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75z"></path>
                  <path d="M12 17.115c-1.892 0-3.633-.95-4.656-2.544-.224-.348-.123-.81.226-1.035.348-.226.812-.124 1.036.226.747 1.162 2.016 1.855 3.395 1.855s2.648-.693 3.396-1.854c.224-.35.688-.45 1.036-.225.35.224.45.688.226 1.036-1.025 1.594-2.766 2.545-4.658 2.545z"></path>
                  <circle cx="8.5" cy="10.5" r="1.5"></circle>
                  <circle cx="15.5" cy="10.5" r="1.5"></circle>
                </svg>
              </div>
              <div className="flex-1 bg-[#2A3942] rounded-lg px-3 py-2 flex items-center">
                <span className="text-[#8696A0] text-sm">Type a message</span>
              </div>
              <div className="ml-2 p-2 rounded-full bg-[#8696A0]">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={sendBulkMessages}
            disabled={sendingBulk || prospectsCount === 0}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            <span>
              {sendingBulk ? 'Sending Messages...' : `Send to ${prospectsCount} Prospect${prospectsCount !== 1 ? 's' : ''}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkMessagePanel;
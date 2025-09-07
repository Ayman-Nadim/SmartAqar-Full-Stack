"use client"
import { useState } from "react"
import { Send, Copy, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react"

const BulkMessagePanel = ({ messageTemplates = [], prospectsCount = 0 }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(
    messageTemplates.length > 0 ? messageTemplates[0].id : null
  )
  const [sendingBulk, setSendingBulk] = useState(false)

  const sendBulkMessages = async () => {
    setSendingBulk(true)
    // Simulate sending process
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setSendingBulk(false)
    alert(`✅ Messages sent to ${prospectsCount} prospects!`)
  }

  const selectedMsg = messageTemplates.find((t) => t.id === selectedTemplate)?.message

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Send Bulk Messages</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose Message Template</label>
              <div className="space-y-3">
                {messageTemplates.length > 0 ? (
                  messageTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(template.message)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.message.substring(0, 100)}...
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No templates available</p>
                )}
              </div>
            </div>

            {/* Preview and Send */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">WhatsApp Message Preview</label>

              <div className="relative mx-auto w-80 h-[600px] bg-black rounded-[2.5rem] p-2 shadow-2xl mb-4">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
                  {/* Status bar */}
                  <div className="bg-[#075E54] text-white px-6 py-1 text-xs font-medium flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <div className="w-6 h-3 border border-white rounded-sm">
                        <div className="w-4 h-2 bg-white rounded-sm m-0.5"></div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp header */}
                  <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <ArrowLeft className="h-5 w-5" />
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">P</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Prospect Name</h3>
                        <p className="text-xs text-green-200">online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Video className="h-5 w-5" />
                      <Phone className="h-5 w-5" />
                      <MoreVertical className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Chat area */}
                  <div
                    className="flex-1 p-4 overflow-y-auto"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' ... %3C/svg%3E")`,
                      backgroundColor: "#e5ddd5",
                    }}
                  >
                    {selectedMsg ? (
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-end">
                          <div className="relative bg-[#dcf8c6] text-gray-800 px-3 py-2 rounded-lg rounded-br-sm max-w-[85%] shadow-sm">
                            <p className="text-sm leading-relaxed">{selectedMsg}</p>
                            <div className="flex items-center justify-end mt-1 space-x-1">
                              <span className="text-xs text-gray-500">12:34</span>
                              <div className="flex space-x-0.5">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-center text-sm bg-white/80 px-4 py-2 rounded-lg">
                          Select a template to preview the message
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="bg-[#f0f0f0] px-4 py-3 flex items-center space-x-3">
                    <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">Type a message</span>
                      <div className="ml-auto flex items-center space-x-2">
                        <div className="w-5 h-5 text-gray-400">📎</div>
                        <div className="w-5 h-5 text-gray-400">📷</div>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-[#075E54] rounded-full flex items-center justify-center">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={sendBulkMessages}
                disabled={sendingBulk || prospectsCount === 0}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
                <span>
                  {sendingBulk ? "Sending Messages..." : `Send to All Prospects (${prospectsCount})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkMessagePanel

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image, Figma, Code, File } from 'lucide-react';

interface DragDropOverlayProps {
  isVisible: boolean;
  isDragOver: boolean;
}

const FILE_TYPES = [
  { icon: Figma, label: 'Figma Files', color: 'text-purple-400' },
  { icon: Image, label: 'Images', color: 'text-green-400' },
  { icon: Code, label: 'Code Files', color: 'text-blue-400' },
  { icon: FileText, label: 'Documents', color: 'text-yellow-400' },
];

export function DragDropOverlay({ isVisible, isDragOver }: DragDropOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0 z-50 pointer-events-none"
        >
          {/* Background Overlay */}
          <motion.div
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ 
              backdropFilter: isDragOver ? 'blur(8px)' : 'blur(4px)',
              backgroundColor: isDragOver ? 'rgba(147, 51, 234, 0.1)' : 'rgba(0, 0, 0, 0.4)'
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"
          />

          {/* Main Drop Zone */}
          <div className="relative h-full flex items-center justify-center p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: isDragOver ? 1.05 : 1,
                opacity: 1
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25 
              }}
              className={`
                relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 
                backdrop-blur-xl rounded-2xl border-2 border-dashed
                ${isDragOver 
                  ? 'border-purple-400 shadow-2xl shadow-purple-500/20' 
                  : 'border-gray-500 shadow-xl'
                }
                p-8 max-w-md w-full text-center transition-all duration-300
              `}
            >
              {/* Upload Icon with Animation */}
              <motion.div
                animate={{ 
                  y: isDragOver ? -8 : 0,
                  scale: isDragOver ? 1.1 : 1
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 20 
                }}
                className="mb-6"
              >
                <div className={`
                  w-16 h-16 mx-auto rounded-full flex items-center justify-center
                  ${isDragOver 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
                  }
                  transition-all duration-300
                `}>
                  <Upload className={`
                    w-8 h-8 transition-all duration-300
                    ${isDragOver ? 'text-white' : 'text-gray-300'}
                  `} />
                </div>
              </motion.div>

              {/* Main Text */}
              <motion.div
                animate={{ 
                  scale: isDragOver ? 1.05 : 1 
                }}
                transition={{ duration: 0.2 }}
              >
                <h3 className={`
                  text-xl font-semibold mb-2 transition-colors duration-300
                  ${isDragOver ? 'text-purple-300' : 'text-white'}
                `}>
                  {isDragOver ? 'Drop files here!' : 'Drop files to analyze'}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  The AI agents will analyze and help you work with your files
                </p>
              </motion.div>

              {/* Supported File Types */}
              <div className="grid grid-cols-2 gap-3">
                {FILE_TYPES.map((fileType, index) => {
                  const IconComponent = fileType.icon;
                  return (
                    <motion.div
                      key={fileType.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.1 + (index * 0.05),
                        duration: 0.3 
                      }}
                      className={`
                        flex items-center space-x-2 p-2 rounded-lg
                        ${isDragOver 
                          ? 'bg-white/10 border border-white/20' 
                          : 'bg-gray-700/50'
                        }
                        transition-all duration-300
                      `}
                    >
                      <IconComponent className={`w-4 h-4 ${fileType.color}`} />
                      <span className="text-xs text-gray-300">{fileType.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Floating Particles Animation */}
              {isDragOver && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: [0, Math.random() * 100 - 50],
                        y: [0, Math.random() * 100 - 50]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeOut"
                      }}
                      className="absolute w-2 h-2 bg-purple-400 rounded-full"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>
          </div>

          {/* Side Indicator */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="absolute left-4 top-1/2 -translate-y-1/2"
          >
            <div className={`
              w-1 h-32 rounded-full transition-all duration-300
              ${isDragOver 
                ? 'bg-gradient-to-b from-purple-400 to-purple-600 shadow-lg shadow-purple-500/50' 
                : 'bg-gradient-to-b from-gray-500 to-gray-600'
              }
            `} />
          </motion.div>

          {/* Corner Indicators */}
          {[
            { position: 'top-4 left-4', rotation: 0 },
            { position: 'top-4 right-4', rotation: 90 },
            { position: 'bottom-4 left-4', rotation: -90 },
            { position: 'bottom-4 right-4', rotation: 180 },
          ].map((corner, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, rotate: corner.rotation }}
              animate={{ 
                scale: isDragOver ? 1.2 : 0.8,
                rotate: corner.rotation + (isDragOver ? 360 : 0)
              }}
              transition={{ 
                delay: 0.1 + (index * 0.05),
                duration: 0.5,
                rotate: { duration: 1, ease: "easeInOut" }
              }}
              className={`absolute ${corner.position}`}
            >
              <div className={`
                w-6 h-6 border-2 border-l-0 border-b-0 transition-colors duration-300
                ${isDragOver ? 'border-purple-400' : 'border-gray-500'}
              `} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
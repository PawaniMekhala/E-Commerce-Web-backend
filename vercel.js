{
    "version"; 2,
    "builds"; [
      { 
        "src": "app.js", 
        "use": "@vercel/node" 
      }
    ],
    "routes"; [
      { 
        "src": "/(.*)", 
        
        "dest": "/app.js" }
    ]
}
  
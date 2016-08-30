define({ "api": [
  {
    "group": "Event",
    "type": "get",
    "url": "/subscribe",
    "title": "Subscribe",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "jwt",
            "description": "<p>JWT token to be relayed to event source. Should be a JWT token issued by SCA Auth service.</p>"
          }
        ]
      }
    },
    "description": "<p>Subscribe to AMQP. Once connected, you need to emit bind messages to bind to specific exchange:key. { &quot;bind&quot;: { &quot;ex&quot;: &quot;wf&quot;, &quot;key&quot;: &quot;task.123455.#&quot;, } } You will receive an error event if you are not authorized</p>",
    "version": "0.0.0",
    "filename": "api/controllers.js",
    "groupTitle": "Event",
    "name": "GetSubscribe"
  },
  {
    "group": "System",
    "type": "get",
    "url": "/health",
    "title": "Get API status",
    "description": "<p>Get current API status</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>'ok' or 'failed'</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers.js",
    "groupTitle": "System",
    "name": "GetHealth"
  }
] });

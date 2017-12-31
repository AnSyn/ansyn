# AnSyn
A satellite imagery management application, for viewing and managing imagery from any source, with many tools to inhance the experience

# Usage
You can not run the app without a backend, and the backend is not currently publicly exposed.

## Deploy
- Client: (from the client's folder)
  - Build for production
  - Staging:
    - sh scripts/deploy.sh ansyn/client-chrome.v.44 $VERSION
  - Production:
    - sh scripts/deploy.sh ansyn/client $VERSION

- Server: (from server's folder)
  - sh ../CLIENT/scripts/deploy.sh ansyn/backend $VERSION

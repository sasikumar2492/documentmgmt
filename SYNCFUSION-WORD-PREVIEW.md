# Syncfusion Word Preview (Original Doc)

Word documents in **AI Conversion → Original Doc** use **Syncfusion Document Editor** when the Syncfusion Word Processor Server is available. That gives true page-by-page layout matching the original document (e.g. page 1 ending at 6.1.5).

## Run the Syncfusion Docker service

1. **Start the Word Processor Server**

   From the project root:

   ```bash
   docker-compose -f docker-compose.syncfusion.yml up -d
   ```

   The API will be at `http://localhost:6002/api/documenteditor`.

2. **Configure the backend**

   In `backend/.env` set (or leave default):

   ```
   DOCUMENT_EDITOR_SERVICE_URL=http://localhost:6002
   ```

   The backend proxies `/api/document-editor/*` to this URL so the frontend can call Import (DOCX → SFDT) and other Document Editor APIs.

3. **Restart the backend** so it picks up the proxy.

4. **Open a Word template** in AI Conversion → Original Doc. The app will try Syncfusion Import; on success you get the Document Editor view with correct pagination. If the service is down or Import fails, it falls back to the previous docx-preview viewer.

## License

Syncfusion Word Processor is a commercial product. For production you need a valid [Syncfusion license key](https://help.syncfusion.com/common/essential-studio/licensing/licensing-faq/where-can-i-get-a-license-key). Set it in `docker-compose.syncfusion.yml`:

```yaml
environment:
  SYNCFUSION_LICENSE_KEY: YOUR_LICENSE_KEY
```

For evaluation/trial you can run without a key (behavior may depend on Syncfusion trial terms).

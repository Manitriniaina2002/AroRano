# Scraper Module

This module adds a lightweight scraping pipeline for building Malagasy translation datasets without new npm dependencies.

## What it stores

- `scraping_jobs`: job metadata, status, progress, timestamps, and scrape results summary.
- `dataset_entries`: source/target text pairs or source-only entries for manual translation.

## Supported job modes

- `wikipedia-bilingual`: scrape an English Wikipedia page, detect the Malagasy interlanguage link, and pair paragraphs.
- `url-pair`: scrape a source URL and a Malagasy target URL you provide.
- `single-url`: scrape one page and save source text for manual translation later.

## API endpoints

- `POST /api/scraper/jobs` - create and start a scraping job
- `GET /api/scraper/jobs` - list jobs
- `GET /api/scraper/jobs/:jobId` - inspect one job
- `POST /api/scraper/jobs/:jobId/run` - rerun a job
- `GET /api/scraper/jobs/:jobId/entries` - list entries for that job
- `GET /api/scraper/entries` - list dataset entries
- `POST /api/scraper/entries` - create a manual entry
- `PATCH /api/scraper/entries/:entryId` - edit an entry
- `DELETE /api/scraper/entries/:entryId` - remove an entry
- `GET /api/scraper/export?format=json|csv|jsonl&jobId=...` - export the dataset

## Notes

- The scraper uses Node.js built-in `http` and `https` modules.
- It follows redirects and extracts content using simple HTML parsing heuristics.
- The job starts immediately after creation and can be polled for status updates.
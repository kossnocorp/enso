test:
	@pnpm exec vitest run
.PHONY: test

test-watch:
	@pnpm exec vitest

test-node:
	@pnpm exec vitest run --project node

test-node-watch:
	@pnpm exec vitest --project node

test-browser:
	@pnpm exec vitest run --project browser

test-browser-watch:
	@pnpm exec vitest --project browser

types:
	@pnpm exec tsc --noEmit

types-watch:
	@pnpm exec tsc --noEmit --watch

types-test: build
	@pnpm exec attw --pack lib

lint:
	@pnpm exec eslint

build: prepare-build
	@pnpm exec tsc -p tsconfig.lib.json
	@env BABEL_ENV=esm pnpm exec babel src --config-file ./babel.config.json --source-root src --out-dir lib --extensions .js,.ts --out-file-extension .js --quiet
	@env BABEL_ENV=cjs pnpm exec babel src --config-file ./babel.config.json --source-root src --out-dir lib --extensions .js,.ts --out-file-extension .cjs --quiet
	@node copy.mjs
	@make build-cts

build-cts:
	@find lib -name '*.d.ts' | while read file; do \
		new_file=$${file%.d.ts}.d.cts; \
		cp $$file $$new_file; \
	done

prepare-build:
	@rm -rf lib
	@mkdir -p lib

publish: build
	cd lib && pnpm publish --access public

publish-next: build
	cd lib && pnpm publish --access public --tag next

link:
	@cd lib && pnpm link

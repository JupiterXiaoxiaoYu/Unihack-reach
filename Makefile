REACH = reach

.PHONY: clean
clean:
	rm -rf build/*.main.mjs

build/%.main.mjs: %.rsh
	$(REACH) compile $^

.PHONY: build
build: build/index.main.mjs
	docker build -f Dockerfile --tag=reachsh/reach-app-code:latest .

.PHONY: run
run:
	$(REACH) run index

.PHONY: run-target
run-target: build
	docker-compose -f "docker-compose.yml" run --rm reach-app-code-$${REACH_CONNECTOR_MODE} $(ARGS)

.PHONY: down
down:
	docker-compose -f "docker-compose.yml" down --remove-orphans


### new

.PHONY: run-live
run-live:
	docker-compose run --rm reach-app-code-ETH-live


.PHONY: run-donor
run-donor:
	docker-compose run --rm donor

.PHONY: run-receiver
run-receiver:
	docker-compose run --rm receiver

.PHONY: run-fundraiser
run-fundraiser:
	docker-compose run --rm fundraiser
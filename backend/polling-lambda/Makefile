login:
	bash -c "aws ecr get-login-password --region ap-northeast-1 --profile sleipnir | docker login --username AWS --password-stdin 529088272092.dkr.ecr.ap-northeast-1.amazonaws.com"

build:
	docker build --platform linux/arm64 -t polling-lambda:latest .
push:
	docker tag polling-lambda:latest 529088272092.dkr.ecr.ap-northeast-1.amazonaws.com/polling-lambda:latest
	docker push 529088272092.dkr.ecr.ap-northeast-1.amazonaws.com/polling-lambda:latest
run:
	docker run --env-file ./.env --platform linux/arm64 -d -v ~/.aws-lambda-rie:/aws-lambda -p 9000:8080 \
		--entrypoint /aws-lambda/aws-lambda-rie \
		polling-lambda:latest \
        /app

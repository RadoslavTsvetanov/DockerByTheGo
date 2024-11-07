cd ..

echo "building base layer"

docker build -f docker/dockerfile.base -t kafka-base .

echo "buildig child imgs"





echo "building main consumer"
docker build -f docker/dockerfile.main_handler -t radoslav123/main_handler . 

echo "building side_consumer"
docker build -f docker/dockerfile.side_consumer -t radoslav123/side_consumer .

echo "building producer"
docker build -f docker/dockerfile.producer -t radoslav123/kafka-producer .
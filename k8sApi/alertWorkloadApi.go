package main

import (
	"context"
	"fmt"
	"log"
	"net"

	pb "k8s/proto"

	"google.golang.org/grpc"
)

type server struct {
	pb.UnimplementedYourServiceServer
}

func (s *server) CreateWorload(ctx context.Context, req *pb.WorkloadRequest) (*pb.WorkloadResponse, error) {
	// Create a workload handler URL using the provided channelId.
	fmt.Println(req.ChannelId)
	workloadHandlerUrl := fmt.Sprintf("http://example.com/workload/%s", req.ChannelId)
	return &pb.WorkloadResponse{WorkloadHandlerUrl: workloadHandlerUrl}, nil

}

func runServer() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterYourServiceServer(grpcServer, &server{})

	fmt.Println("Server is running on port 50051...")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

package templates

// Define type for ExposureType enum
type ExposureType string

const (
	Exposed  ExposureType = "exposed"
	Internal ExposureType = "internal"
)

// Define type for Mode enum
type Mode string

const (
	Managed   Mode = "managed"
	Unmanaged Mode = "unmanaged"
)

// Exposure struct using the enum type for ExposureType
type Exposure struct {
	Type ExposureType
}

// Pure metadata field which is not used in any way when creating a container
type TemplateMetadata struct {
	Author      string // references the account of the creator
	Version     string
	Description string
}

// TemplateContainer struct with updated enum fields for exposure and mode
type TemplateContainer struct {
	ImageName string            `json:"imageName"` // Fixed closing backtick
	Name      string            `json:"name"`
	Exposure  Exposure          `json:"exposure"`  // Fixed closing backtick
	Env       map[string]string `json:"env"`
	Mode      Mode              `json:"mode"`
	Metadata  TemplateMetadata  `json:"metadata"`
	Labels    map[string]string `json:"labels"`    // Added missing JSON tag
	Port      int               `json:"port"`
}

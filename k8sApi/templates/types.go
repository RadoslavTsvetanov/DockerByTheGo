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
	Name        string // name of the template
}

// TemplateContainer struct with updated enum fields for exposure and mode
type TemplateContainer struct {
	ImageName string            `json:"imageName"`
	Name      string            `json:"name"` // name of the container which will be deployed from the template
	Exposure  Exposure          `json:"exposure"`
	Env       map[string]string `json:"env"`
	Mode      Mode              `json:"mode"`
	Metadata  TemplateMetadata  `json:"metadata"`
	Labels    map[string]string `json:"labels"`
	Port      int               `json:"port"`
}

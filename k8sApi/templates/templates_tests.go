package templates

import (
	"testing"
)

func testApplyingTemplateContainerWithNormalValues(t *testing.T) {

	tc := TemplateContainer{
		ImageName: "nginx",
		Name:      "nginx-container",
		Exposure:  Exposure{Type: Exposed},
		Env: map[string]string{
			"FOO": "bar",
		},
		Mode: Managed,
		Metadata: TemplateMetadata{
			Author:      "John Doe",
			Version:     "1.0.0",
			Description: "Nginx web server container",
		},
		Labels: map[string]string{
			"app": "nginx",
		},
		Port: 80,
	}

	err := ApplyTemplateToProject("my-project", []TemplateContainer{tc})
	if err != nil {
		t.Error(err)
	}

}


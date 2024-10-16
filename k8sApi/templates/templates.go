package templates

import (
	"errors"
	. "k8s/primitives"
	helper "k8s/project_highlevel_interface"
)

func ApplyTemplateToProject(projectName string, templates []TemplateContainer) error {

	for _, template := range templates {
		if template.Mode == Managed {
			helper.CreateManagedContainer(projectName, template.Name, template.Env, template.Labels, template.ImageName, template.Port)
		} else if template.Mode == Unmanaged {
			helper.CreateUnmanagedContainer(projectName, template.Name, template.Env, template.Labels, template.ImageName, template.Port)
		} else {
			return errors.New("invalid template mode")
		}
	}

	return nil
}

func exportCurrentProjectAsTemplate() ([]TemplateContainer, error) {

	templates, err := GetAllContainersFromProject()
	DefaultHandleError(err)

	return templates, nil
}

// api endpoints
func createTemplate(Template []TemplateContainer) {

}

func deleteTemplate(templateName string) {

}

func GetAllContainersFromProject() ([]TemplateContainer, error) { // TODO: think of how to retrieve the containers, will you carry the k8s ckuster directly and try building it up the prject data or will you save the projects data somewhere and retrieve it
	return []TemplateContainer{}, nil
}

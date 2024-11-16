package api
type User struct {
    Username  string `json:"username" bson:"username"`
    Password  string `json:"password" bson:"password"`
    K8sToken  string `json:"k8sToken" bson:"k8sToken"`
}

type SessionManager struct {
    Sessions map[string]string
}

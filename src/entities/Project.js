{
    "name": "Project",
    "type": "object",
    "properties": {
    "name": {
        "type": "string",
            "description": "Nome do projeto"
    },
    "cover_image": {
        "type": "string",
            "description": "URL da imagem de capa do projeto"
    },
    "what_is": {
        "type": "string",
            "description": "O que \u00e9 o projeto?"
    },
    "how_to_do": {
        "type": "string",
            "description": "Como fazer o projeto?"
    },
    "what_to_expect": {
        "type": "string",
            "description": "O que esperar do projeto?"
    },
    "status": {
        "type": "string",
            "enum": [
            "not_started",
            "in_progress",
            "completed"
        ],
            "default": "not_started",
            "description": "Status atual do projeto"
    },
    "total_steps": {
        "type": "number",
            "default": 0,
            "description": "Total de etapas do projeto"
    },
    "completed_steps": {
        "type": "number",
            "default": 0,
            "description": "Etapas conclu\u00eddas"
    },
    "progress": {
        "type": "number",
            "default": 0,
            "description": "Percentual de progresso (0-100)"
    }
},
    "required": [
    "name",
    "what_is",
    "how_to_do",
    "what_to_expect"
]
}
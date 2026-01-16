{
    "name": "Objective",
    "type": "object",
    "properties": {
    "project_id": {
        "type": "string",
            "description": "ID do projeto ao qual pertence"
    },
    "title": {
        "type": "string",
            "description": "T\u00edtulo do objetivo"
    },
    "order": {
        "type": "number",
            "default": 0,
            "description": "Ordem de exibi\u00e7\u00e3o"
    },
    "total_steps": {
        "type": "number",
            "default": 0,
            "description": "Total de etapas do objetivo"
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
    "project_id",
    "title"
]
}
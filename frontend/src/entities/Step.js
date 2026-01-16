{
    "name": "Step",
    "type": "object",
    "properties": {
    "project_id": {
        "type": "string",
            "description": "ID do projeto"
    },
    "objective_id": {
        "type": "string",
            "description": "ID do objetivo ao qual pertence"
    },
    "title": {
        "type": "string",
            "description": "T\u00edtulo da etapa"
    },
    "order": {
        "type": "number",
            "default": 0,
            "description": "Ordem de exibi\u00e7\u00e3o"
    },
    "is_completed": {
        "type": "boolean",
            "default": false,
            "description": "Se a etapa foi conclu\u00edda"
    },
    "completion_note": {
        "type": "string",
            "description": "Observa\u00e7\u00e3o obrigat\u00f3ria ao concluir"
    },
    "completed_at": {
        "type": "string",
            "format": "date-time",
            "description": "Data/hora da conclus\u00e3o"
    },
    "completed_by": {
        "type": "string",
            "description": "Quem concluiu a etapa"
    }
},
    "required": [
    "project_id",
    "objective_id",
    "title"
]
}
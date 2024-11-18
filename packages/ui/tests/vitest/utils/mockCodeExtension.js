import {VsCodeMessageTypes} from 'shared';

export default (callbacks = {}) => {
  vitest.stubGlobal('acquireVsCodeApi', () => ({
    postMessage: ({id, type}) => {
      const messageFromExtension = {id, type: type.replace('extension.', 'ui.')};
      
      switch (type) {
        case VsCodeMessageTypes.getSocketConfig: {
          messageFromExtension.data = callbacks.socketConfig
            ? callbacks.socketConfig(socketConfigData)
            : socketConfigData;
          break;
        }
        case VsCodeMessageTypes.getModelSettings: {
          messageFromExtension.data = callbacks.modelSettings
            ? callbacks.modelSettings(modelSettingsData)
            : modelSettingsData;
          break;
        }
        case VsCodeMessageTypes.getPrompts: {
          messageFromExtension.data = callbacks.prompts
            ? callbacks.prompts(promptsData)
            : promptsData;
          break;
        }
        case VsCodeMessageTypes.getDatasources: {
          messageFromExtension.data = callbacks.datasources
            ? callbacks.datasources(datasourcesData)
            : datasourcesData;
          break;
        }
        case VsCodeMessageTypes.getApplications: {
          messageFromExtension.data = callbacks.applications
            ? callbacks.applications(applicationsData)
            : applicationsData;
          break;
        }
        case VsCodeMessageTypes.getDeployments: {
          messageFromExtension.data = callbacks.deployments
            ? callbacks.deployments(deploymentsData)
            : deploymentsData;
          break;
        }
        case VsCodeMessageTypes.getSelectedText: {
          messageFromExtension.data = callbacks.selectedText
            ? callbacks.selectedText(selectedTextData)
            : selectedTextData;
          break;
        }
        case VsCodeMessageTypes.getDatasourceDetail: {
          messageFromExtension.data = callbacks.datasourceDetail
            ? callbacks.datasourceDetail(datasourceDetailData)
            : datasourceDetailData;
          break;
        }
      }
      
      window.postMessage(messageFromExtension, '*');
    }
  }));
};

const socketConfigData = {
  projectId: 555,
  host: 'wss://test.projectalita.test',
  token: 'test_token',
  path: '/socket.io'
};

const modelSettingsData = {
  model: {
    model_name: 'gpt-4o'
  },
  temperature: 0.8,
  max_tokens: 4096,
  top_p: 0.8,
  top_k: 40,
  stream: true
};

const promptsData = [
  {
    "id": 6,
    "name": "Test Cases",
    "description": "",
    "owner_id": 57,
    "created_at": "2024-08-29T12:17:45.744434",
    "authors": [
      {
        "id": 91,
        "email": "liana_gevorgyan@epam.com",
        "name": "Liana Gevorgyan",
        "avatar": "https://static.cdn.epam.com/avatar/9caa794aaf38c4cfecaa8ae4f549f22f.jpg"
      }
    ],
    "tags": [
      {
        "name": "code",
        "data": {
          "color": "red"
        },
        "id": 1
      }
    ],
    "status": "draft"
  },
  {
    "id": 1,
    "name": "SQL Task",
    "description": "This prompt will provide step by step DB creation",
    "owner_id": 57,
    "created_at": "2024-08-29T11:17:27.448751",
    "authors": [
      {
        "id": 91,
        "email": "liana_gevorgyan@epam.com",
        "name": "Liana Gevorgyan",
        "avatar": "https://static.cdn.epam.com/avatar/9caa794aaf38c4cfecaa8ae4f549f22f.jpg"
      }
    ],
    "tags": [
      {
        "name": "code",
        "data": {
          "color": "red"
        },
        "id": 1
      }
    ],
    "status": "draft"
  }
];

const datasourcesData = [];

const applicationsData = [];

const deploymentsData = [
  {
    "id": 14,
    "project_id": null,
    "name": "open_ai_azure",
    "section": {
      "name": "ai",
      "integration_description": "Manage ai integrations",
      "test_planner_description": ""
    },
    "settings": {
      "api_token": "{{secret.f232638af6e44beab9415b3b25055745}}",
      "model_name": "gpt-35-turbo",
      "models": [
        {
          "id": "gpt-4o-mini",
          "name": "gpt-4o-mini",
          "capabilities": {
            "completion": false,
            "chat_completion": true,
            "embeddings": false
          },
          "token_limit": 16384
        }
      ],
      "api_version": "2023-03-15-preview",
      "api_base": "https://alita-useast-openai.openai.azure.com/",
      "api_type": "azure",
      "temperature": 0,
      "max_tokens": 512,
      "top_p": 0.8,
      "stream": false
    },
    "is_default": false,
    "config": {
      "name": "gpt-4o-mini",
      "is_shared": true
    },
    "task_id": null,
    "status": "success",
    "uid": "c241d875-9917-4bc1-8be6-508e03701860"
  },
];

const selectedTextData = 'Mocked selected text for tests';


const datasourceDetailData = {
  "name": "Deduplication",
  "description": "Deduplication",
  "versions": [
    {
      "id": 5,
      "name": "latest",
      "status": "draft",
      "created_at": "2024-09-06T13:58:48.550289"
    }
  ],
  "embedding_model_settings": {
    "model_name": "sentence-transformers/all-MiniLM-L6-v2"
  },
  "owner_id": 888,
  "shared_id": null,
  "shared_owner_id": null,
  "embedding_model": "c1b107b5-6b24-4dce-a3a6-e523a9651e88",
  "storage": "112618ea-62ce-47e8-9413-1e20586bf94f",
  "storage_settings": {
    "persist_directory": "/data/cache/chroma/"
  },
  "id": 5,
  "version_details": {
    "name": "latest",
    "tags": [
      {
        "name": "code",
        "data": {
          "color": "red"
        },
        "id": 1
      }
    ],
    "context": "",
    "datasource_settings": {
      "chat": {
        "chat_settings_embedding": {
          "fetch_k": 30,
          "page_top_k": 1,
          "top_k": 10,
          "cut_off_score": 0.8,
          "integration_uid": "c1b107b5-6b24-4dce-a3a6-e523a9651e88",
          "model_name": "sentence-transformers/all-mpnet-base-v2",
          "str_content": null
        },
        "chat_settings_ai": {
          "temperature": 0.2,
          "top_p": 0.8,
          "maximum_length": 1024,
          "top_k": 10,
          "integration_uid": "596884aa-fc90-4e19-8de0-8ef90fa5a9b6",
          "model_name": "gpt-4o"
        }
      },
      "search": null,
      "deduplicate": {
        "chat_settings_embedding": {
          "cut_off_score": 0.8,
          "show_additional_metadata": false,
          "exclude_fields": "",
          "integration_uid": "c1b107b5-6b24-4dce-a3a6-e523a9651e88",
          "model_name": "sentence-transformers/all-MiniLM-L6-v2"
        }
      }
    },
    "conversation_starters": [],
    "welcome_message": "",
    "author_id": 6,
    "datasource_id": 5,
    "shared_id": null,
    "shared_owner_id": null,
    "uuid": "e04857d5-2639-4641-a8de-7f190119ae79",
    "id": 5,
    "status": "draft",
    "created_at": "2024-09-06T13:58:48.550289",
    "author": {
      "id": 6,
      "email": "levon_dadayan@epam.com",
      "name": "Levon Dadayan",
      "avatar": "https://static.cdn.epam.com/avatar/b399c32a139f68d913426eb629b1fd06.jpg"
    },
    "datasets": [
      {
        "name": "Test",
        "status": "ready",
        "source_type": "table",
        "source_settings": {
          "file": {
            "original_name": "Infongen_test cases.csv",
            "bucket": "datasets",
            "name": "source_5de3d064-b221-4f52-adb0-f333b8b9e017.csv"
          },
          "column_delimiter": ",",
          "columns": [
            "Test steps",
            "Expected result"
          ],
          "encoding": "auto",
          "json_documents": true,
          "raw_content": false
        },
        "transformers": {
          "split_by": "chunks",
          "extractor": "Bert",
          "split_options": {
            "regex": "",
            "chunk_size": 1000,
            "chunk_overlap": 100
          },
          "extractor_options": {
            "strategy": "max_sum",
            "keyword_count": 5
          },
          "extract_for_chunks": false,
          "extract_for_document": true
        },
        "summarization": {
          "ai_model_name": "",
          "ai_integration_uid": "",
          "chunk_summarization": false,
          "document_summarization": false,
          "chunk_summarization_prompt": "CODE: {{content}}\n__________________________________________\nSUMMARIZATION: ",
          "document_summarization_prompt": "You are acting as a code documentation expert for a project. Below is the code from a file that has the name '{{source}}'. Write a detailed technical explanation of what this code does. Create a constructor with a description of the input and output parameters of functions and objects Focus on the high-level purpose of the code and how it may be used in the larger project. Include code examples where appropriate. Keep you response between 100 and 300 words. DO NOT RETURN MORE THAN 300 WORDS. Output should be in markdown format. Do not just list the methods and classes in this file.\nCode: {{content}}\nResponse:"
        },
        "datasource_version_id": 5,
        "id": 5,
        "created_at": "2024-09-06T13:59:16.226872",
        "task_id": "f88c866c-11bc-4ad6-b381-4448266aae25"
      }
    ]
  },
  "created_at": "2024-09-06T13:58:48.550289",
  "collections": []
}

// DATA_SOURCE_BAD
const dsBad = {
  "name": "ELITEA Documentation",
  "description": "The purpose of this datasource is to allow you to ask various questions about Alita and get proper responses from Alita documentation.",
  "versions": [
    {
      "id": 1,
      "name": "latest",
      "status": "draft",
      "created_at": "2024-06-21T12:24:43.348855"
    }
  ],
  "embedding_model_settings": {
    "model_name": "sentence-transformers/all-MiniLM-L6-v2"
  },
  "owner_id": 888,
  "shared_id": null,
  "shared_owner_id": null,
  "embedding_model": "e5d50550-6edd-4a0c-98a6-c984f804b846",
  "storage": "112618ea-62ce-47e8-9413-1e20586bf94f",
  "storage_settings": {},
  "id": 1,
  "version_details": {
    "name": "latest",
    "tags": [
      {
        "name": "code",
        "data": {
          "color": "red"
        },
        "id": 1
      },
      {
        "name": "tag2",
        "data": {
          "color": "#efe482"
        },
        "id": 13
      },
      {
        "name": "tag3",
        "data": {
          "color": "red"
        },
        "id": 20
      },
      {
        "name": "tag4",
        "data": {
          "color": "black"
        },
        "id": 21
      }
    ],
    "context": "Write like Vincent van Gogh",
    "datasource_settings": {
      "chat": {
        "chat_settings_embedding": null,
        "chat_settings_ai": null
      },
      "search": {
        "chat_settings_embedding": null
      },
      "deduplicate": {
        "chat_settings_embedding": null
      }
    },
    "conversation_starters": [],
    "welcome_message": "",
    "author_id": 6,
    "datasource_id": 1,
    "shared_id": null,
    "shared_owner_id": null,
    "uuid": "250b9890-ca7e-44cf-b912-419cc5daa469",
    "id": 1,
    "status": "draft",
    "created_at": "2024-06-21T12:24:43.348855",
    "author": {
      "id": 6,
      "email": "levon_dadayan@epam.com",
      "name": "Levon Dadayan",
      "avatar": "https://static.cdn.epam.com/avatar/b399c32a139f68d913426eb629b1fd06.jpg"
    },
    "datasets": [
      {
        "name": "Elitea Documentation",
        "status": "ready",
        "source_type": "git",
        "source_settings": {
          "default_loader": "TextLoader",
          "extension_whitelist": [],
          "extension_blacklist": [],
          "url": "https://github.com/ProjectAlita/projectalita.github.io.git",
          "branch": "main",
          "multithreading": false,
          "ssh_key": null,
          "username": null,
          "password": null
        },
        "transformers": {
          "split_by": "chunks",
          "extractor": "Bert",
          "split_options": {
            "regex": "",
            "chunk_size": 1000,
            "chunk_overlap": 100
          },
          "extractor_options": {
            "strategy": "max_sum",
            "keyword_count": 5
          },
          "extract_for_chunks": false,
          "extract_for_document": true
        },
        "summarization": {
          "ai_model_name": "",
          "ai_integration_uid": "",
          "chunk_summarization": false,
          "document_summarization": false,
          "chunk_summarization_prompt": "CODE: {code} \n__________________________________________ \nSUMMARIZATION: {summarization}",
          "document_summarization_prompt": "You are acting as a code documentation expert for a project. Below is the code from a file that has the name '{fileName}'. Write a detailed technical explanation of what this code does. Create a constructor with a description of the input and output parameters of functions and objects Focus on the high-level purpose of the code and how it may be used in the larger project. Include code examples where appropriate. Keep you response between 100 and 300 words. DO NOT RETURN MORE THAN 300 WORDS. Output should be in markdown format. Do not just list the methods and classes in this file.\ncode: {fileContents}\nResponse:"
        },
        "datasource_version_id": 1,
        "id": 1,
        "created_at": "2024-06-21T12:25:34.426700",
        "task_id": "2d5701f9-9746-4368-ba9e-5f3b56c520c5"
      }
    ]
  },
  "created_at": "2024-06-21T12:24:43.348855",
  "collections": []
}
export interface MermaidTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
}

export const templates: MermaidTemplate[] = [
  {
    id: 'flowchart-basic',
    name: 'Basic Flowchart',
    description: 'A simple flowchart example',
    category: 'Flowchart',
    code: `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`
  },
  {
    id: 'flowchart-complex',
    name: 'Complex Flowchart',
    description: 'A more detailed flowchart with multiple paths',
    category: 'Flowchart',
    code: `flowchart LR
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]
    D --> F[Final]
    E --> F`
  },
  {
    id: 'sequence-basic',
    name: 'Sequence Diagram',
    description: 'Basic sequence diagram showing interactions',
    category: 'Sequence',
    code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`
  },
  {
    id: 'sequence-advanced',
    name: 'Advanced Sequence',
    description: 'Sequence diagram with activation boxes',
    category: 'Sequence',
    code: `sequenceDiagram
    autonumber
    participant Client
    participant Server
    participant Database
    
    Client->>+Server: Request Data
    Server->>+Database: Query
    Database-->>-Server: Result Set
    Server-->>-Client: Response`
  },
  {
    id: 'erd-basic',
    name: 'Entity Relationship Diagram',
    description: 'Database ERD example',
    category: 'ERD',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    
    CUSTOMER {
        string name
        string email
        string phone
    }
    ORDER {
        int orderNumber
        date orderDate
        string status
    }
    LINE-ITEM {
        int quantity
        decimal price
    }`
  },
  {
    id: 'state-basic',
    name: 'State Machine',
    description: 'Basic state machine diagram',
    category: 'State Machine',
    code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]

    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`
  },
  {
    id: 'state-complex',
    name: 'Complex State Machine',
    description: 'Advanced state machine with composite states',
    category: 'State Machine',
    code: `stateDiagram-v2
    [*] --> Active

    state Active {
        [*] --> NumLockOff
        NumLockOff --> NumLockOn : EvNumLockPressed
        NumLockOn --> NumLockOff : EvNumLockPressed
        --
        [*] --> CapsLockOff
        CapsLockOff --> CapsLockOn : EvCapsLockPressed
        CapsLockOn --> CapsLockOff : EvCapsLockPressed
    }

    Active --> Suspended : EvSuspend
    Suspended --> Active : EvResume`
  },
  {
    id: 'class-diagram',
    name: 'Class Diagram',
    description: 'Object-oriented class diagram',
    category: 'Class',
    code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }`
  },
  {
    id: 'gantt-basic',
    name: 'Gantt Chart',
    description: 'Project timeline Gantt chart',
    category: 'Gantt',
    code: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d`
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    description: 'Simple pie chart visualization',
    category: 'Pie',
    code: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`
  }
];

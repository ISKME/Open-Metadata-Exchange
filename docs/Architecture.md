# High level architecture of the OME

## Peer-2-Peer Network
```mermaid
    C4Context
title OME Network

   Enterprise_Boundary(Library_1, "Library 1") {

      System_Ext(InHouseSoftware_1, "Library Software", "Existing In-House Library Software")

      package "OME Node.1" {
      	 System(API_1, "OME Software", "Made up of Search/API/UI")
         System(P2P_1, "P2P", "Data transport")
      }   

      Rel(InHouseSoftware_1, API_1, "Import/Export/Search and other workflows")
   }


   Enterprise_Boundary(Library_2, "Library 2") {

      System_Ext(InHouseSoftware_2, "Library Software", "Existing In-House Library Software")

      package "OME Node.2" {
      	 System(API_2, "OME Software", "Made up of Search/API/UI")
         System(P2P_2, "P2P", "Data transport")
      }   

      Rel(InHouseSoftware_2, API_2, "Import/Export/Search and other workflows")
   }


   Enterprise_Boundary(Library_3, "Library 3") {

      System_Ext(InHouseSoftware_3, "Library Software", "Existing In-House Library Software")

      package "OME Node.3" {
      	 System(API_3, "OME Software", "Made up of Search/API/UI")
         System(P2P_3, "P2P", "Data transport")
      }   

      Rel(InHouseSoftware_3, API_3, "Import/Export/Search and other workflows")
   }


   Enterprise_Boundary(Library_4, "Library 4") {

      System_Ext(InHouseSoftware_4, "Library Software", "Existing In-House Library Software")

      package "OME Node.4" {
      	 System(API_4, "OME Software", "Made up of Search/API/UI")
         System(P2P_4, "P2P", "Data transport")
      }   

      Rel_U(InHouseSoftware_4, API_4, "Import/Export/Search and other workflows")
   }


   Enterprise_Boundary(Library_5, "Library 5") {

      System_Ext(InHouseSoftware_5, "Library Software", "Existing In-House Library Software")

      package "OME Node.5" {
      	 System(API_5, "OME Software", "Made up of Search/API/UI")
         System(P2P_5, "P2P", "Data transport")
      }   

      Rel_U(InHouseSoftware_5, API_5, "Import/Export/Search and other workflows")
   }


   Enterprise_Boundary(Library_6, "Library 6") {

      System_Ext(InHouseSoftware_6, "Library Software", "Existing In-House Library Software")

      package "OME Node.6" {
      	 System(API_6, "OME Software", "Made up of Search/API/UI")
         System(P2P_6, "P2P", "Data transport")
      }   

      Rel_U(InHouseSoftware_6, API_6, "Import/Export/Search and other workflows")
   }

   Enterprise_Boundary(Library_7, "Library 7") {
      System_Ext(InHouseSoftware_7, "Library Software", "Existing In-House Library Software")
   }


   Rel(P2P_1, P2P_2, "")
   Rel(P2P_1, P2P_3, "")
   Rel(P2P_3, P2P_4, "")
   Rel(P2P_3, P2P_6, "")
   Rel_U(P2P_5, P2P_2, "")

   Rel(InHouseSoftware_7, API_1, "Import/Export/Search and other workflows")
   
```



## Anatomy of a Node

```mermaid
    C4Context

' title OME Network

   Enterprise_Boundary(Library, "Library 1") {

   Person(Librarian1, Librarian , "<$user> \n Responsible for curation" )
   Person(Author1, Author , "<$user> \n Responsible for authoring resource" )
   ' Person(Educator1, Educator , "<$user> \n Responsible for picking resource to use" )
   ' Person(Student1, Student , "<$user> \n End-user of resources" )

      System_Ext(InHouseSoftware1, "Library Software", "Existing In-House Library Software")

   Rel(Librarian1, InHouseSoftware1, "Uses the OME UI embedded in their library software to curate (import/export) OME content")
   Rel(Author1, InHouseSoftware1, "Creates resources")

      package "OME Node" {
    	 System(UI_1, "UI", "Common UI that has OME workflows built-in")

    	 System(Search_1, "Search", "Search index")
    	 System(API_1, "API")

	 System_Ext(Bridge_1, "Plugin", "Necessary bits to facilitate import/export from library software to the OME")

         System(P2P_1, "P2P", "Data transport")

	 Rel(UI_1, API_1, "")
	 Rel(API_1, Search_1, "Search")
	 Rel(API_1, P2P_1, "Publish to OME")
	 Rel(P2P_1, Search_1, "Index OME resources")

	 Rel(API_1, Bridge_1, "Import into the Library software")
	 Rel(Bridge_1, InHouseSoftware1, "Import into the Library software")

	 Lay_D(API_1, Search_1)
      }   

   }

   Rel_Neighbor(InHouseSoftware1, UI_1, "UI component hosted within the library software")
   Lay_D(InHouseSoftware1, UI_1)
```

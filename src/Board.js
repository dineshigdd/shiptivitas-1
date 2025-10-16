import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    
   this.state = {
    clients:{}
   }

    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    }
    
    this.nextKey = null;
  }

    

  async getClients() {
         const response  = await fetch('/api/v1/clients')
         const clientData = await response.json();      
         console.log( clientData )
 
                  
        return clientData.map(({ id, name, description, status, priority }) => ({
            id,
            name,
            description,
            status,
            priority
        }));
  }


   

  renderSwimlane(name, clients, ref) {
    
    return (
      clients && <Swimlane name={name} clients={clients} dragulaRef={ref}/>
    );
  }

  renderDragula(){
    const drake = Dragula([ this.swimlanes.backlog.current, this.swimlanes.inProgress.current, this.swimlanes.complete.current ],
        //  {
        //  accepts: (el, target, source) =>   {
        //         if( target === this.swimlanes.backlog.current &&  source === this.swimlanes.inProgress.current ) {
        //           return false;
        //         }
                
        //         if( target === this.swimlanes.backlog.current && source === this.swimlanes.complete.current  ){
        //           return false;
        //         }

        //         if( target === this.swimlanes.inProgress.current && source ===  this.swimlanes.complete.current ){
        //           return false;
        //         }                
                
        //         if( target === this.swimlanes.complete.current && source === this.swimlanes.backlog.current ){
        //           return false;
        //         }

        //         return true;                
        //      }
       
        // }
      );
        
        drake.on('drop',(el, target, source, sibling)=>
            {
              const swimlaneColumn = el.closest(".Swimlane-column");
              if (!swimlaneColumn) return; // for Safeguard

              const titleElement = swimlaneColumn.querySelector(".Swimlane-title");
              if (!titleElement) return; // for Safeguard

              const newStatus = titleElement.textContent.trim();
              const id = el.dataset.id;
              const status = el.dataset.status;
              let clientToUpdate = null; 
              let siblingIndex;       
              let clients;
              let sourceClientGroup;
              let targetGroup;
              
              if( target !== source ){
                  el.remove()
                  this.setState( prevState =>{
                      
                    
                      clients = {
                          backlog: [...prevState.clients.backlog],
                          inProgress: [...prevState.clients.inProgress],
                          complete: [...prevState.clients.complete],
                      };
                  
                  
                   
                      //  let sourceClientGroup;
                      //find the source group that card belongs to
                       if (status === 'in-progress') {
                          sourceClientGroup = clients.inProgress;
                        } else if (status === 'complete') {
                          sourceClientGroup = clients.complete;
                        } else {
                          sourceClientGroup = clients.backlog;
                        }
                       
                   
                      //find the client to be updated
                        clientToUpdate = sourceClientGroup.find( client => client.id === Number( id ));                        
                        if (!clientToUpdate) return { clients }; // Safety check
                        
                      //changing the status of the client
                      //  let targetGroup;
                      if( newStatus === 'In Progress' ){

                          clientToUpdate.status = 'in-progress';                           
                          targetGroup = [ ...clients.inProgress ]                              
                          clients.inProgress = targetGroup;                         
                          clients.backlog = sourceClientGroup;
                          
                      }else if( newStatus === 'Complete'){             

                          clientToUpdate.status = 'complete';                       
                          targetGroup = [ ...clients.complete]                            
                          clients.complete = targetGroup;                                                                 
                          clients.inProgress = sourceClientGroup;                           
                          
                        }       
                       
                        //remove the moved card from the source                       
                        sourceClientGroup = sourceClientGroup.filter( client =>  client.id !== clientToUpdate.id );                                             
                        
                   
                         siblingIndex = sibling
                            ? Array.from(target.children).indexOf(sibling)
                            : targetGroup.length; // append at end if no sibling
                        
                         if( targetGroup) {
                              targetGroup.splice(siblingIndex, 0, clientToUpdate);
                          }                       
                                                                                     
                   
                    return {
                      clients 
                    };                   
                    
                  },  
                      // ()=>  this.setPriorityAndStatus( clients )   
                      // ()=> { 
                      //   const priority = siblingIndex + 1;
                      //   clientToUpdate && 
                      //   this.sendToAPI( clientToUpdate , priority   ) 
                      // }
                      
                  );
                 /*   drake.cancel( true )  to  prevent 
                 the error NotFoundError: Failed to execute 'removeChild' 
                 on 'Node': The node to be removed is not a child of this node. */   
                 drake.cancel( true )               
                 this.categorizedClients()
                 this.setPriorityAndStatus( sourceClientGroup, targetGroup )
                }else{ //when the swimlane does not change,and client moves up/down in the samw swimlane
                  this.setPriority( el, source, status , id )
                 
                  
                  
                }  
                
               
          })
          
    
  }
  
  setPriorityAndStatus(sourceClientGroup, targetGroup ){
    
      fetch('/api/v1/clients/lane-change',{
                        method:'PUT',
                        headers:{
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            sourceClientGroup,
                            targetGroup
                            
                        })
        }).then( res => console.log( res ))
  }

  setPriority( el, source, status , id  ){
     //get new index from the swimlane elements             
          
                   const updatedSourceGroup =  Array.from(source.children);
                   const priority = updatedSourceGroup.indexOf( el );          
                  
                  //getting the source group in the state
                     let sourceClientGroup;
                     (  status === 'in-progress' ) ?  
                      ( sourceClientGroup =  [...this.state.clients.inProgress ]):   
                      ( sourceClientGroup =  [...this.state.clients[ status ] ]);                   
                    
                  //getting the previous Index of the client in the state
                    const client = ( sourceClientGroup.find( client => client.id === Number(id)) );
                    const prevPriority = sourceClientGroup.indexOf( client );
                    
                  //Changing the priority in the source Group in the state
                    sourceClientGroup.splice( prevPriority , 1 )
                    sourceClientGroup.splice( priority, 0 , client)
                    
                  //updating the state                  
                    this.setState( prevState => {
                     if( status === 'in-progress'){
                        return [...prevState.clients.inProgress = sourceClientGroup ];
                      }

                     return [...prevState.clients[ status] = sourceClientGroup ];

                    },
                   
                     ()=>{ 
                      fetch('/api/v1/clients/reorder',{
                        method:'PUT',
                        headers:{
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            clients:sourceClientGroup,
                            
                        })
                      }).then( res => console.log( res ))
  

                    }
                  );
                
                  
  }

  sendToAPI(clientToUpdate, priority ){   
   
    fetch(`/api/v1/clients/${ clientToUpdate.id }`, {
        method:'PUT',   
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status:clientToUpdate.status,
          priority: priority,
        })
      }
   ).then( res => console.log( res ))
  
  }

  //as sorted clients based on priorty is received from the backend this function is not neccsary.
  //I added this function as only as an exttra layer if unsorted clients are received due to a backend error
  sortClientsOnPriority( categorizedClientsArr ){  
     return categorizedClientsArr.sort( ( client_1, client_2) =>  client_1.priority - client_2.priority );
  }

  categorizedClients(){
    this.setState({ clients:{          
            backlog: this.state.clients.backlog.filter(client => !client.status || client.status === 'backlog'),
            inProgress: this.state.clients.inProgress.filter(client => client.status && client.status === 'in-progress'),
            complete: this.state.clients.complete.filter(client => client.status && client.status === 'complete'),
          }   
   })
    
  }

  async componentDidMount(){    
        const clients = await this.getClients();     
         
        const categorizedClients = {
            backlog: clients.filter(client => !client.status || client.status === 'backlog'),
            inProgress: clients.filter(client => client.status && client.status === 'in-progress'),
            complete: clients.filter(client => client.status && client.status === 'complete'),
          }     
      
        //sort clients based on priorty
        const sortedClients ={
          backlog: this.sortClientsOnPriority( categorizedClients.backlog ),
          inProgress: this.sortClientsOnPriority( categorizedClients.inProgress ),
          complete: this.sortClientsOnPriority( categorizedClients.complete ),
        }        
        

        this.setState( { clients: sortedClients });        
        this.renderDragula();
        
        
  }

 


  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane('Backlog', this.state.clients.backlog, this.swimlanes.backlog)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('In Progress', this.state.clients.inProgress, this.swimlanes.inProgress)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('Complete', this.state.clients.complete, this.swimlanes.complete)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}


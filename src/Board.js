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
       
 

        return clientData.map(companyDetails =>({
                id: companyDetails.id,
                name: companyDetails.name,
                description: companyDetails.description,
                status: companyDetails.status
            }));
  }

   

  renderSwimlane(name, clients, ref) {
    
    return (
      clients && <Swimlane name={name} clients={clients} dragulaRef={ref}/>
    );
  }

  renderDragula(){
    Dragula([ this.swimlanes.backlog.current, this.swimlanes.inProgress.current, this.swimlanes.complete.current ],
         {
         accepts: (el, target, source) =>   {
                if( target === this.swimlanes.backlog.current &&  source === this.swimlanes.inProgress.current ) {
                  return false;
                }
                
                if( target === this.swimlanes.backlog.current && source === this.swimlanes.complete.current  ){
                  return false;
                }

                if( target === this.swimlanes.inProgress.current && source ===  this.swimlanes.complete.current ){
                  return false;
                }                
                
                if( target === this.swimlanes.complete.current && source === this.swimlanes.backlog.current ){
                  return false;
                }

                return true;                
             }
       
        }
        )
          .on('drop',(el, target, source, sibling)=>
            {
              const swimlaneColumn = el.closest(".Swimlane-column");
              if (!swimlaneColumn) return; // for Safeguard

              const titleElement = swimlaneColumn.querySelector(".Swimlane-title");
              if (!titleElement) return; // for Safeguard

              const newStatus = titleElement.textContent.trim();
              
              const id = el.dataset.id;
              const status = el.dataset.status;
              console.log(id )
              
              if( target !== source ){
                  el.remove()
                  this.setState( prevState =>{
                      
                    
                      const clients = {
                          backlog: [...prevState.clients.backlog],
                          inProgress: [...prevState.clients.inProgress],
                          complete: [...prevState.clients.complete],
                      };
                  
                      let sourceClientGroup;
                   

                      //find the source group that card belongs to
                       if (status === 'in-progress') {
                          sourceClientGroup = clients.inProgress;
                        } else if (status === 'complete') {
                          sourceClientGroup = clients.complete;
                        } else {
                          sourceClientGroup = clients.backlog;
                        }
                       
                   
                      //find the client to be updated
                        const clientToUpdate = sourceClientGroup.find( client => client.id === Number( id ));                        
                        if (!clientToUpdate) return { clients }; // Safety check
                        
                      //changing the status of the client
                       let targetGroup;
                      if( newStatus === 'In Progress' ){

                          clientToUpdate.status = 'in-progress'; 
                          console.log( clients.inProgress)        
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
                       
                                               
                        
                         let siblingIndex;
                         siblingIndex = sibling
                            ? Array.from(target.children).indexOf(sibling)
                            : targetGroup.length; // append at end if no sibling
                         
                         if( targetGroup) {
                              targetGroup.splice(siblingIndex, 0, clientToUpdate);
                          }                          
                                            
                                                   
                      
                    return {
                      clients 
                    };                   

                  })
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
      
     
        this.setState( { clients: categorizedClients });        
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

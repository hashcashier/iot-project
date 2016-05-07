package server;

import java.util.*;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.net.*;
import java.io.*;

import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;

import ontology.FriendFinderOntology;
import semantic.mirror.Mirror;
import models.World;

public class Server {
  
	public static void main(String[] args) throws IOException {
		int port = 9000;
		HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
		System.out.println("server started at " + port);
		server.createContext("/", new RootHandler());
		server.createContext("/query", new EchoGetHandler());
		server.start();
	}

}

class RootHandler implements HttpHandler {

        int port = 9000;

         
         public void handle(HttpExchange he) throws IOException {
                 String response = "<h1>Friends Finder Ontology</h1>"
                 		+ "<br/>"
                 		+ "<form action='query'><textarea name='q' rows='4' cols='50'></textarea><input type='submit'/></form>";
                 he.sendResponseHeaders(200, response.length());
                 OutputStream os = he.getResponseBody();
                 os.write(response.getBytes());
                 os.close();
         }
}


class EchoGetHandler implements HttpHandler {


         public void handle(HttpExchange he) throws IOException {
                 // parse request
                 Map<String, Object> parameters = new HashMap<String, Object>();
                 URI requestedUri = he.getRequestURI();
                 String query = requestedUri.getRawQuery();
                 parseQuery(query, parameters);

                 // send response
                 String response = "";
                 String squery = (String) parameters.get("q");
                 World world = Mirror.getWorld();
                 FriendFinderOntology.createIndividuals(world);
                 Model m = FriendFinderOntology.om;
                 System.out.println("");
                 String result = "Result: ";
                 
                 Query jenaquery = QueryFactory.create(squery);
                 QueryExecution qexec = QueryExecutionFactory.create(jenaquery, m);
                 try {
                     ResultSet results = qexec.execSelect();
                     while ( results.hasNext() ) {
                         result = result + "\n" + results.nextSolution().toString();
                     }
                 } finally {
                     qexec.close();
                 }
                
                 response = result;
                 
//                 for (String key : parameters.keySet())
//                          response += key + " = " + parameters.get(key) + "\n";
                 he.sendResponseHeaders(200, response.length());
                 OutputStream os = he.getResponseBody();
                 os.write(response.toString().getBytes());

                 os.close();
         }


public static void parseQuery(String query, Map<String, 
	Object> parameters) throws UnsupportedEncodingException {

         if (query != null) {
                 String pairs[] = query.split("[&]");
                 for (String pair : pairs) {
                          String param[] = pair.split("[=]");
                          String key = null;
                          String value = null;
                          if (param.length > 0) {
                          key = URLDecoder.decode(param[0], 
                          	System.getProperty("file.encoding"));
                          }

                          if (param.length > 1) {
                                   value = URLDecoder.decode(param[1], 
                                   System.getProperty("file.encoding"));
                          }

                          if (parameters.containsKey(key)) {
                                   Object obj = parameters.get(key);
                                   if (obj instanceof List<?>) {
                                            List<String> values = (List<String>) obj;
                                            values.add(value);

                                   } else if (obj instanceof String) {
                                            List<String> values = new ArrayList<String>();
                                            values.add((String) obj);
                                            values.add(value);
                                            parameters.put(key, values);
                                   }
                          } else {
                                   parameters.put(key, value);
                          }
                 }
         }
}
}

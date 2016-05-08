package server;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import models.World;
import ontology.FriendFinderOntology;
import semantic.mirror.Mirror;

public class Server {


    static Runnable worldBuilderRunnable = new Runnable() {

        public void run() {
            try {
                while(true){
                    Mirror.buildWord();
                    Thread.sleep(3 * 1000);
                }
            } catch (InterruptedException e) {
            }
        }
    };

	public static void main(String[] args) throws IOException, InterruptedException {

        Thread worldBuilder = new Thread(worldBuilderRunnable);
        worldBuilder.start();

        Thread.sleep(1000);

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
                 		+ "<form action='query'><textarea name='q' rows='20' cols='60'></textarea><br/><input type='submit'/></form>";
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
                 String squery = (String) parameters.get("q");
                 World world = Mirror.getWorld();
                 Model m = FriendFinderOntology.createIndividuals(world);

                 m.write(System.out, "N-TRIPLE");

                 OutputStream out = he.getResponseBody();

                 String response = "<style></style><h1>Friends Finder Ontology</h1>"
                 		+ "<br/>"
                 		+ "<form action='query'><textarea name='q' rows='20' cols='60'>" + squery + "</textarea><br/><input type='submit'/></form>";

                 try {
                     Query jenaquery = QueryFactory.create(squery);
                     QueryExecution qexec = QueryExecutionFactory.create(jenaquery, m);
                     ResultSet results = qexec.execSelect();

                     response += "<table border='1'>";
                     List<String> vars = results.getResultVars();

                     response += "<tr>";
                     for(String v : vars){
                         response += "<td>";
                         response += v;
                         response += "</td>";
                     }
                     response += "</tr>";

                     while(results.hasNext()){
                         QuerySolution sol = results.next();
                         response += "<tr>";
                         for(String v : vars){
                             response += "<td>";
                             response += sol.get(v);
                             response += "</td>";
                         }
                         response += "</tr>";
                     }
                     response += "</table>";

                     qexec.close();

                 } catch(Exception e){
                     response += "Compile Error :<br />" + e.getLocalizedMessage();
                 }

                 he.sendResponseHeaders(200, response.length());
                 out.write(response.getBytes());
                 out.close();
                 he.close();

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
